from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Hello World"}

@app.get("/cities/")
def cities():
    return [{"id": 1, "name": "Moscow", "country": "Russia", "population": 12600000},
            {"id": 2, "name": "Saint Petersburg", "country": "Russia", "population": 5300000}]

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8088) 