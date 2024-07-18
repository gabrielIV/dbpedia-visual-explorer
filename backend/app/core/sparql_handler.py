import requests
from app.core.config import settings

def execute_sparql_query(query: str):
    """
    Execute a SPARQL query against the DBpedia endpoint
    """
    headers = {
        'Accept': 'application/sparql-results+json'
    }
    
    response = requests.post(
        settings.DBPEDIA_ENDPOINT,
        headers=headers,
        data={'query': query}
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Query failed with status code {response.status_code}")

def get_entity_data(entity: str):
    """
    Get information about an entity from DBpedia, including specific properties
    """
    query = f"""
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX dbo: <http://dbpedia.org/ontology/>
    
    SELECT ?property ?value
    WHERE {{
        <http://dbpedia.org/resource/{entity}> ?property ?value .
        FILTER(
            ?property = rdfs:seeAlso ||
            ?property = dbo:thumbnail ||
            (?property = rdfs:comment && LANG(?value) = 'en')
        )
    }}
    """
    return execute_sparql_query(query)

def run_custom_query(query: str):
    """
    Run a custom SPARQL query
    """
    return execute_sparql_query(query)