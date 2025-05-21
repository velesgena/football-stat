import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.city import City

# Тестовые данные
TEST_CITY = {
    "name": "Тестовый город",
    "country": "Тестовая страна",
    "population": 10000
}

def test_read_cities(client: TestClient, db_session: Session):
    """Тест получения списка городов"""
    # Создаем тестовый город в БД
    db_city = City(**TEST_CITY)
    db_session.add(db_city)
    db_session.commit()
    db_session.refresh(db_city)
    
    # Выполняем запрос
    response = client.get("/cities/")
    
    # Проверяем ответ
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    
    # Проверяем, что созданный город есть в списке
    city_ids = [city["id"] for city in data]
    assert db_city.id in city_ids

def test_read_city(client: TestClient, db_session: Session):
    """Тест получения города по ID"""
    # Создаем тестовый город в БД
    db_city = City(**TEST_CITY)
    db_session.add(db_city)
    db_session.commit()
    db_session.refresh(db_city)
    
    # Выполняем запрос
    response = client.get(f"/cities/{db_city.id}")
    
    # Проверяем ответ
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == db_city.id
    assert data["name"] == TEST_CITY["name"]
    assert data["country"] == TEST_CITY["country"]
    assert data["population"] == TEST_CITY["population"]

def test_create_city(client: TestClient):
    """Тест создания нового города"""
    response = client.post(
        "/cities/",
        json=TEST_CITY
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == TEST_CITY["name"]
    assert data["country"] == TEST_CITY["country"]
    assert data["population"] == TEST_CITY["population"]
    assert "id" in data

def test_update_city(client: TestClient, db_session: Session):
    """Тест обновления данных города"""
    # Создаем тестовый город в БД
    db_city = City(**TEST_CITY)
    db_session.add(db_city)
    db_session.commit()
    db_session.refresh(db_city)
    
    # Данные для обновления
    update_data = {"name": "Обновленный город"}
    
    # Выполняем запрос
    response = client.put(
        f"/cities/{db_city.id}",
        json=update_data
    )
    
    # Проверяем ответ
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == db_city.id
    assert data["name"] == update_data["name"]
    assert data["country"] == TEST_CITY["country"]  # Не должно измениться

def test_delete_city(client: TestClient, db_session: Session):
    """Тест удаления города"""
    # Создаем тестовый город в БД
    db_city = City(**TEST_CITY)
    db_session.add(db_city)
    db_session.commit()
    db_session.refresh(db_city)
    
    # Выполняем запрос на удаление
    response = client.delete(f"/cities/{db_city.id}")
    
    # Проверяем ответ
    assert response.status_code == 204
    
    # Проверяем, что город удален из БД
    deleted_city = db_session.query(City).filter(City.id == db_city.id).first()
    assert deleted_city is None 