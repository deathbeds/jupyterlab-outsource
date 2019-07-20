import traitlets as T
from traitlets.config import LoggingConfigurable

import socketio as S


class YWebSocketsManager(LoggingConfigurable):
    sio = T.Instance(S.AsyncServer)

    def get_handler(self):

        _Handler = S.get_tornado_handler(self.sio)

        mgr = self

        class SocketHandler(_Handler):
            def check_xsrf_cookie(self):
                pass

            async def on_message(self, message):
                mgr.log.error(f"MSG {msg}")
                await super().on_message(message)

        return SocketHandler

    @T.default("sio")
    def _default_sio(self):
        s = S.AsyncServer(async_mode="tornado")

        @s.on("connect")
        async def connect(sid, environ): return await self._on_connect(sid, environ)

        @s.on("disconnect")
        async def disconnect(sid): return await self._on_disconnect(sid)

        @s.on("joinRoom")
        async def join(sid, data): return await self._on_join(sid, data)

        @s.on("yjsEvent")
        async def y_event(sid, data): return await self._on_receive(sid, data)

        @s.on("leaveRoom")
        async def leave(sid, data): return await self._on_leave(sid, data)

        return s

    @property
    def web_app(self):
        return self.parent.web_app

    async def _on_connect(self, sid, enviorn):
        self.parent.log.error(f"Connected {sid}")

    async def _on_disconnect(self, sid):
        self.parent.log.error(f"disconnect {sid}")

    async def _on_join(self, sid, data):
        self.parent.log.error(f"{sid} joins {data}")
        return await self.sio.enter_root(sid, data["room"])

    async def _on_receieve(self, sid, data):
        self.parent.log.error(f"{sid} SAYS {data}")
        return await self.sio.emit("yjsEvent", data,  skip_sid=sid)
