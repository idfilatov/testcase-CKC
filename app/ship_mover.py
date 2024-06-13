import random

import requests
import aiohttp
import asyncio


async def send_point(session, url, delay, data):
    cnt = 0
    shift_lon = random.uniform(-1, 1)
    shift_lat = random.uniform(-1, 1)
    shift_speed = random.uniform(-1, 1)
    while True:
        cnt += 1
        await asyncio.sleep(delay)  # Задержка перед запросом
        data['longitude'] += shift_lon * cnt
        data['latitude'] += shift_lat * cnt
        data['speed'] += shift_speed * cnt
        async with session.post(url, json=data) as response:
            await response.text()


def fetch_start_pos():
    url = 'http://localhost:8000/ships'
    response = requests.get(url)
    data = response.json()
    return data


async def main(start_positions):
    url = 'http://localhost:8000/ships/{ship_id}/point'
    async with aiohttp.ClientSession() as session:
        urls_and_delays_and_data = [
            (url.format(ship_id=i), i, {'key1': 'value1'}) for i in range(1, 6)
        ]

        tasks = [
            send_point(session, url.format(ship_id=1), 1, data=[item for item in start_positions if item['ship_id'] == 1][0]),
            send_point(session, url.format(ship_id=2), 1, data=[item for item in start_positions if item['ship_id'] == 2][0]),
            send_point(session, url.format(ship_id=3), 1, data=[item for item in start_positions if item['ship_id'] == 3][0]),
            send_point(session, url.format(ship_id=4), 1, data=[item for item in start_positions if item['ship_id'] == 4][0]),
            send_point(session, url.format(ship_id=5), 1, data=[item for item in start_positions if item['ship_id'] == 5][0]),
        ]
        responses = await asyncio.gather(*tasks)

        for response in responses:
            print(response)


if __name__ == '__main__':
    s = fetch_start_pos()
    asyncio.run(main(s))