from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "DBpedia Visual Explorer"
    DBPEDIA_ENDPOINT: str = "https://dbpedia.org/sparql"

    class Config:
        env_file = ".env"

settings = Settings()