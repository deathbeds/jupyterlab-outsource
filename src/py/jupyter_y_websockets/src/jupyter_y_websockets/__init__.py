from notebook.utils import url_path_join as ujoin

from ._version import __version__
from .manager import YWebSocketsManager


def _jupyter_server_extension_paths():
    raise Exception("POOP")
    return [{"module": "jupyter_y_websockets"}]


def load_jupyter_server_extension(nbapp):
    mgr = YWebSocketsManager(parent=nbapp)

    app = nbapp.web_app
    url = ujoin(app.settings["base_url"], "/y/ws/")
    handler = mgr.get_handler()
    app.add_handlers(".*$", [(url, handler)])
    nbapp.log.debug(f"y is listening on {url}")
