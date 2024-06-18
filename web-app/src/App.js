import './App.css';
import React, { useState, useEffect } from 'react';
import { YMaps, Map, Placemark, Polyline } from '@pbe/react-yandex-maps';
import Modal from 'react-modal';
import axios from 'axios';
Modal.setAppElement('#root');


const MyModal = ({ modalData, onCloseModal, onClickRoute }) => {
  return (
    <div>
      <div className='ModalHeader'>
        <div className='ModalShipName'>{modalData.name}</div>
        <button className='ModalHeaderCloseButton' onClick={onCloseModal} />
      </div>

      <img src={modalData.photo} alt={`${modalData.name}`} style={{ width: '100%' }} />
      <div className='ModalShipInfo'>
        <div>Рег. номер: {modalData.registration_number}</div>
        <div>Широта: {modalData.lat.toFixed(3)}</div>
      </div>
      <div className='ModalShipInfo'>
        <div>Скорость: {modalData.speed.toFixed(2)}</div>
        <div>Долгота: {modalData.lon.toFixed(3)}</div>
      </div>
      <button className="ModalRouteButton" onClick={() => onClickRoute(modalData.ship_id)}>Показать маршрут</button>
    </div>
  )
}


const App = () => {
  const [ships, setShips] = useState({});
  const [selectedShip, setSelectedShip] = useState(null);
  const [route, setRoute] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [simulation, setSimulation] = useState(false);

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

  useEffect(() => {
    fetchInitialData();

    const socket = new WebSocket('ws://localhost:8000/ships/ws');

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const { longitude, latitude, speed, ship_id } = data;

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

    return () => {
      socket.close();
    };
  }, []);

  const handlePlacemarkClick = async (ship_id) => {
    try {
      const response = await axios.get(`http://localhost:8000/ships/${ship_id}`);
      const modal_data = {
        ship_id: ship_id,
        ...response.data,
        ...ships[ship_id],
      }
      setModalData(modal_data);
      setSelectedShip(ship_id);
    } catch (error) {
      console.error('Error fetching ship data:', error);
    }
  };

  const handleStartShipsClick = async () => {
    try {
      setSimulation(true);
      fetchInitialData();
      const response = await axios.get(`http://localhost:8000/ships/move`);
      setSimulation(false);
    } catch (error) {
      console.error('Error fetching ship data:', error);
      setSimulation(false);
    }
  };

  const fetchShipRoute = async (ship_id) => {
    try {
      const response = await axios.get(`http://localhost:8000/ships/${ship_id}/route`);
      setRoute(response.data);
    } catch (error) {
      console.error('Error fetching ship data:', error);
    }
  }

  const closeModal = () => {
    setSelectedShip(null);
    setModalData(null);
    setRoute(null);
  };

  return (
    <div>
      <header>
        <h1>ShipRadar</h1>
        <button disabled={simulation} onClick={() => handleStartShipsClick()} className='start-button'>Начать движение кораблей</button>

      </header>
      <div>
        <YMaps>
          <Map
            defaultState={{ center: [59.95, 30], zoom: 11 }}
            options={{ mapAutoFit: true }}
            width="100vw" height="100vh"

          >
            {
              Object.keys(ships).map((shipId) =>
                <Placemark
                  onClick={() => handlePlacemarkClick(shipId)}
                  key={shipId}
                  options={{
                    preset: "islands#circleDotIcon",
                    iconColor: shipId === selectedShip ? "#185a70" : "#6fbfc8",
                  }}
                  geometry={[ships[shipId].lat, ships[shipId].lon]}
                />
              )
            }

            {route && <Polyline
              geometry={route.map((point) => [point.latitude, point.longitude])}
              options={{
                strokeColor: "#000",
                strokeWidth: 4,
                strokeOpacity: 0.7,
                strokeStyle: {
                  style: 'dot',
                  offset: 10
                }
              }}
            />
            }
          </Map>
        </YMaps>
      </div>
      <Modal
        isOpen={selectedShip !== null}
        onRequestClose={closeModal}
        overlayClassName="ModalOverlay"
        className="ModalContent"
      >
        {modalData && (
          <MyModal
            modalData={modalData}
            onCloseModal={closeModal}
            onClickRoute={() => fetchShipRoute(modalData.ship_id)}
          />
        )}
      </Modal>
    </div>
  );
}

export default App;
