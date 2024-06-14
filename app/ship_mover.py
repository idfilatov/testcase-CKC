import random

import aiohttp
import asyncio

from app._support import _utils

url = 'http://localhost:8000/ships/{ship_id}/point'


async def send_route_for_ship(session, ship_id):
    filename = f'{ship_id}_route.json'
    route = _utils.load_route(filename)
    for point in route[1:]:
        data = {'ship_id': ship_id}
        await asyncio.sleep(random.randint(2, 6))  # Задержка перед запросом
        data['longitude'] = point[0]
        data['latitude'] = point[1]
        data['speed'] = random.uniform(2, 5)
        print(f'send data {data}')
        try:
            async with session.post(url.format(ship_id=ship_id), json=data) as response:
                await response.text()
        except:
            pass


async def main():
    async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=10)) as session:
        tasks = [
            send_route_for_ship(session, ship_id=i) for i in range(1, 6)
        ]
        await asyncio.gather(*tasks)


if __name__ == '__main__':
    asyncio.run(main())