import './App.css';
import React, { useState, useEffect } from 'react';
import { YMaps, Map, Placemark, Polyline } from '@pbe/react-yandex-maps';
import Modal from 'react-modal';
import axios from 'axios';
Modal.setAppElement('#root');

const App = () => {
  const [ships, setShips] = useState({});
  const [selectedShip, setSelectedShip] = useState(null);
  const [route, setRoute] = useState(null);
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    // Выполнение GET-запроса для получения начальных данных
    const fetchInitialData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/ships');
        const initialData = response.data;
        const initialShips = initialData.reduce((acc, ship) => {
          acc[ship.ship_id] = {
            lat: ship.latitude,
            lon: ship.longitude,
            speed: ship.speed,
          };
          return acc;
        }, {});
        setShips(initialShips);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();

    // Настройка WebSocket для получения обновлений
    const socket = new WebSocket('ws://localhost:8000/ships/ws');

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(`евент сокета ${data}`);
      const { longitude, latitude, speed, ship_id } = data;
      console.log(`из сокета пришла новая позиция ${ship_id}: ${longitude} ${latitude}`);

      setShips((prevShips) => ({
        ...prevShips,
        [ship_id]: {
          lat: latitude,
          lon: longitude,
          speed: speed,
        },
      }));
    };

    socket.onopen = () => {
      console.log('WebSocket connection opened');
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Очистка WebSocket при размонтировании компонента
    return () => {
      socket.close();
    };
  }, []);

  const handlePlacemarkClick = async (ship_id) => {
    try {
      const response = await axios.get(`http://localhost:8000/ships/${ship_id}`);
      console.log(`кликнут корабль ${ship_id}`);
      const modal_data = {
        ship_id: ship_id,
        ...response.data,
        ...ships[ship_id],
      }
      console.log(`инфа для модалки: ${Object.keys(modal_data)}`);
      setModalData(modal_data);
      setSelectedShip(ship_id);
    } catch (error) {
      console.error('Error fetching ship data:', error);
    }
  };

  const fetchShipRoute = async (ship_id) => {
    try {
      console.log(`прошу маршрут для ${ship_id}`)
      const response = await axios.get(`http://localhost:8000/ships/${ship_id}/route`);
      // console.log(`маршрут получен ${response.data}`)
      // for (let x of response.data) {
      //   console.log(x)
      // }
      setRoute(response.data);
      // setSelectedShip(null);
    } catch (error) {
      console.error('Error fetching ship data:', error);
    }
  }

  const closeModal = () => {
    setSelectedShip(null);
    setModalData(null);
    setRoute(null);
  };


  const customStyles = {
    content: {
      top: '10%',
      left: '10%',
      right: 'auto',
      bottom: 'auto',
      width: '400px',
      height: 'fit-content',
      pointerEvents: 'auto', // Это позволяет модалке не перехватывать события кликов
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.0)',
      pointerEvents: 'none', // Это позволяет overlay не перехватывать события кликов
    },
  };

  const modalContentStyles = {
    pointerEvents: 'auto', // Это позволяет элементам внутри модалки быть кликабельными
  };

  return (
    <div>
      <YMaps>
        <div className="App">
          <header className="App-header">

            <Map defaultState={{ center: [15, -72.1], zoom: 6 }} width="100vw" height="100vh" >
              {/* <Placemark geometry={[15, -72.1]} /> */}
              {/* {[{ id: 1, lat: 15, lon: -72.1 }].map((x) => {
              return (
                <Placemark
                  onClick={() => {
                    alert("Выбран корабль " + (x.id));
                  }}
                  key={x.id}
                  geometry={[x.lat, x.lon]}
                  options={{
                    iconImageSize: [10, 10],
                    preset: "islands#yellowDotIcon"
                  }}
                />
              );
            })} */}
              {
                Object.keys(ships).map((shipId) =>
                  <Placemark
                    onClick={() => handlePlacemarkClick(shipId)}
                    key={shipId}
                    options={{
                      iconImageSize: [30, 30],
                      preset: "islands#circleDotIcon",
                      iconColor: shipId === selectedShip ? "rgb(251, 102, 97)" : "#61dafb",
                      hideIconOnBalloonOpen: true,
                      openEmptyHint: true,
                      hintContent: { shipId }
                    }}
                    properties={{
                      iconContent: "+",
                      hintContent: { shipId },
                      balloonContent: 'wrwrerb'
                    }}

                    geometry={[ships[shipId].lat, ships[shipId].lon]}
                  />
                )
              }

              {route && <Polyline
                geometry={route.map((point) => [point.latitude, point.longitude])}
                options={{
                  balloonCloseButton: false,
                  strokeColor: "#000",
                  strokeWidth: 4,
                  strokeOpacity: 0.5,
                }}
              />
              }
            </Map>
          </header>
        </div>
      </YMaps>
      <Modal
        isOpen={selectedShip !== null}
        onRequestClose={closeModal}
        contentLabel="Ship Details"
        style={customStyles}
      >
        {modalData && (
          <div style={modalContentStyles}>
            <h2>{modalData.name} ({modalData.ship_id})</h2>
            <p>Registration Number: {modalData.registration_number}</p>
            <p>Speed: {modalData.speed}</p>
            <img src={modalData.photo} alt={`${modalData.name}`} style={{ width: '100%' }} />
          </div>
        )}
        <button onClick={() => fetchShipRoute(modalData.ship_id)}>Показать маршрут</button>
        <button onClick={closeModal}>Close</button>
      </Modal>
    </div>
  );
}

export default App;
