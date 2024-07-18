from fastapi import APIRouter, HTTPException, Body
from app.core.sparql_handler import get_entity_data
from app.core.data_processor import process_data, process_related_entities
from typing import List, Dict, Any
import asyncio
import aiohttp

router = APIRouter()

@router.get("/entity/{entity_name}")
async def get_entity(entity_name: str):
    try:
        raw_data = get_entity_data(entity_name)
        processed_data = process_data(raw_data, entity_name)
        return processed_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def fetch_entity(session: aiohttp.ClientSession, entity_url: str) -> Dict[str, Any]:
    entity_name = entity_url.split("/")[-1]
    async with session.get(f"http://localhost:8000/api/entity/{entity_name}") as response:
        if response.status == 200:
            return await response.json()
        else:
            return {"query": entity_name, "data": {"seeAlso": [], "thumbnail": None, "comment": None}}

@router.post("/fetch-related-entities")
async def fetch_related_entities(entity_data: Dict[str, Any] = Body(...)):
    try:
        see_also_urls = entity_data['data']['seeAlso']
        
        async with aiohttp.ClientSession() as session:
            tasks = [fetch_entity(session, url) for url in see_also_urls]
            results = await asyncio.gather(*tasks)
        
        processed_results = process_related_entities(entity_data, results)
        return processed_results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))