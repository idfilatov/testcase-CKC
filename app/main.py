from contextlib import asynccontextmanager

import uvicorn
from fastapi import (
    FastAPI,
    HTTPException,
    Request,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app._support import _utils
from app import routes


@asynccontextmanager
async def lifespan(app: FastAPI):
    _utils.generate_mock_ships()
    yield


def create_app():
    app = FastAPI(title='Ships', lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=['*'],
        allow_credentials=True,
        allow_methods=['*'],
        allow_headers=['*'],
    )

    app.include_router(routes.router)

    @app.exception_handler(HTTPException)
    def handling_exc(request: Request, exc: HTTPException):
        return JSONResponse(content=exc.detail, status_code=exc.status_code)

    return app


app = create_app()

if __name__ == '__main__':
    uvicorn.run('app.main:app', host='localhost', port=8000, reload=True)
