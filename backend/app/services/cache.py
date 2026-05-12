import redis
import os
import json
from typing import Optional, Any
from functools import wraps

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

redis_client: Optional[redis.Redis] = None


def get_redis() -> redis.Redis:
    global redis_client
    if redis_client is None:
        redis_client = redis.from_url(REDIS_URL, decode_responses=True)
    return redis_client


def cache_set(key: str, value: Any, expire: int = 300):
    try:
        r = get_redis()
        r.set(key, json.dumps(value), ex=expire)
    except Exception as e:
        print(f"Redis cache_set error: {e}")


def cache_get(key: str) -> Optional[Any]:
    try:
        r = get_redis()
        data = r.get(key)
        if data:
            return json.loads(data)
    except Exception as e:
        print(f"Redis cache_get error: {e}")
    return None


def cache_delete(key: str):
    try:
        r = get_redis()
        r.delete(key)
    except Exception as e:
        print(f"Redis cache_delete error: {e}")


def cache_clear_pattern(pattern: str):
    try:
        r = get_redis()
        for key in r.scan_iter(pattern):
            r.delete(key)
    except Exception as e:
        print(f"Redis cache_clear_pattern error: {e}")


def cached(expire: int = 300, key_prefix: str = ""):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            cache_key = f"{key_prefix}:{func.__name__}:{str(args)}:{str(kwargs)}"
            cached_value = cache_get(cache_key)
            if cached_value is not None:
                return cached_value
            result = func(*args, **kwargs)
            cache_set(cache_key, result, expire)
            return result
        return wrapper
    return decorator
