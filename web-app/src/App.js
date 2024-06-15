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
      await axios.get(`http://localhost:8000/ships/move`);
    } catch (error) {
      console.error('Error fetching ship data:', error);
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
      <button onClick={() => handleStartShipsClick()} className='StartSimulation'>Начать движение кораблей</button>
      <YMaps>
        <Map defaultState={{ center: [15, -72.1], zoom: 6 }} width="100vw" height="100vh" >
          {
            Object.keys(ships).map((shipId) =>
              <Placemark
                onClick={() => handlePlacemarkClick(shipId)}
                key={shipId}
                options={{
                  iconLayout: 'default#image',
                  iconImageHref: shipId === selectedShip ? '/shipmark-selected.png' : '/shipmark.png',
                  iconImageSize: [45, 45],
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
      <Modal
        isOpen={selectedShip !== null}
        onRequestClose={closeModal}
        overlayClassName="ModalOverlay"
        className="ModalContent"
      >
        {modalData && (
          <div>
            <div className='ModalHeader'>
              <div className='ModalShipName'>{modalData.name}</div>
              <button className='ModalHeaderCloseButton' onClick={closeModal} />
            </div>

            <img src={modalData.photo} alt={`${modalData.name}`} style={{ width: '100%' }} />
            <div className='ModalShipInfo'>
              <div>Регистрационный номер: {modalData.registration_number}</div>
              <div>Скорость: {modalData.speed.toFixed(2)}</div>
            </div>
            <button className="ModalRouteButton" onClick={() => fetchShipRoute(modalData.ship_id)}>Показать маршрут</button>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default App;
