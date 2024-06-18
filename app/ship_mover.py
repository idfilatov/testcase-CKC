import random

import aiohttp
import asyncio

from app._support import _utils

url = 'http://localhost:8000/ships/{ship_id}/point'


async def send_route_for_ship(session, ship_id):
    filename = f'{ship_id}_route.json'
    route = _utils.load_route(filename)
    for point in route:
        data = {'ship_id': ship_id}
        # await asyncio.sleep(random.randint(1, 4))  # Задержка перед запросом
        await asyncio.sleep(1)  # Задержка перед запросом
        data['longitude'] = point[0]
        data['latitude'] = point[1]
        data['speed'] = random.uniform(2, 5)
        try:
            async with session.post(url.format(ship_id=ship_id), json=data) as response:
                await response.text()
        except:
            pass


async def main():
    async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=10)) as session:
        tasks = [
            send_route_for_ship(session, ship_id=i) for i in [1, 2, 3, 4, 5]
        ]
        await asyncio.gather(*tasks)


if __name__ == '__main__':
    asyncio.run(main())