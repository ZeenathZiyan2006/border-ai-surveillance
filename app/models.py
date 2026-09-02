from sqlalchemy import Column, Integer, String, Float
from app.database import Base


class Camera(Base):
    __tablename__ = "cameras"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    status = Column(String, default="offline")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(Integer, nullable=False)
    alert_type = Column(String, nullable=False)
    message = Column(String, nullable=False)
    severity = Column(String, default="medium")
    confidence = Column(Float, nullable=True)
