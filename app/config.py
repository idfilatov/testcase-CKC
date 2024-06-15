import logging

logger = logging.Logger('main_logger')
logger.setLevel(logging.DEBUG)
console_handler = logging.StreamHandler()
formatter = logging.Formatter('{asctime} {levelname:10} ::: {message}', style='{')
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)
