from datetime import datetime
from app.database import get_db
from app.crud.token import delete_expired_tokens
from app.utils.logging import get_logger

logger = get_logger("app.tasks")

async def cleanup_expired_tokens():
    """
    Задача для очистки просроченных refresh токенов.
    Запускается периодически для очистки базы данных.
    """
    logger.info("Запуск задачи очистки просроченных токенов")
    db = next(get_db())
    try:
        deleted = delete_expired_tokens(db)
        logger.info(f"Очищено {deleted} просроченных токенов")
    except Exception as e:
        logger.error(f"Ошибка при очистке просроченных токенов: {str(e)}")
    finally:
        db.close() 