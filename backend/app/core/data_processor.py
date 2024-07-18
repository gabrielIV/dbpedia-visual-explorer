from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

PRIORITY_PROPERTIES = {
    'http://www.w3.org/2000/01/rdf-schema#seeAlso': 'seeAlso',
    'http://dbpedia.org/ontology/thumbnail': 'thumbnail',
    'http://www.w3.org/2000/01/rdf-schema#comment': 'comment'
}

def clean_data(raw_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Clean and structure the raw data from DBpedia, prioritizing specific properties
    """
    cleaned_data = []
    for result in raw_data.get('results', {}).get('bindings', []):
        property_uri = result.get('property', {}).get('value', '')
        value = result.get('value', {}).get('value', '')
        
        if property_uri in PRIORITY_PROPERTIES:
            property_name = PRIORITY_PROPERTIES[property_uri]
            cleaned_data.append({
                'property': property_name,
                'value': value
            })
    
    return cleaned_data

def prioritize_properties(data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Organize data by prioritizing specific properties
    """
    prioritized_data = {
        'seeAlso': [],
        'thumbnail': None,
        'comment': None
    }

    for item in data:
        prop = item['property']
        if prop == 'seeAlso':
            prioritized_data[prop].append(item['value'])
        elif prop == 'thumbnail':
            prioritized_data[prop] = item['value']
        elif prop == 'comment':
            prioritized_data[prop] = item['value']

    return prioritized_data

def calculate_relevance(main_entity: Dict[str, Any], related_entities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Calculate relevance scores for related entities and include the main entity
    """
    main_comment = main_entity['data']['comment']
    main_see_also = set(main_entity['data']['seeAlso'])
    main_name = main_entity['query']

    # Prepare comments for TF-IDF
    all_comments = [main_comment] + [entity['data']['comment'] for entity in related_entities if entity['data']['comment']]
    
    # Calculate TF-IDF and cosine similarity
    tfidf = TfidfVectorizer().fit_transform(all_comments)
    cosine_similarities = cosine_similarity(tfidf[0:1], tfidf).flatten()

    relevant_entities = []

    # Add main entity to the list with maximum relevance
    relevant_entities.append({
        **main_entity,
        'relevance': 1.0,
        'card_size': 100,
        'distance': 0
    })

    for i, entity in enumerate(related_entities):
        relevance_score = 0
        
        # Text similarity (0-1 score)
        if entity['data']['comment']:
            relevance_score += cosine_similarities[i + 1]  # +1 because main entity is at index 0
        
        # Shared seeAlso links (0-1 score)
        entity_see_also = set(entity['data']['seeAlso'])
        shared_links = len(main_see_also.intersection(entity_see_also))
        relevance_score += min(shared_links / len(main_see_also), 1) if main_see_also else 0
        
        # Presence of main entity name in related entity comment (0 or 1 score)
        if entity['data']['comment'] and main_name.lower() in entity['data']['comment'].lower():
            relevance_score += 1
        
        # Presence of related entity name in main entity comment (0 or 1 score)
        if main_comment and entity['query'].lower() in main_comment.lower():
            relevance_score += 1
        
        # Normalize relevance score (0-1 range)
        relevance_score /= 4

        # Calculate card size (50-100 range)
        card_size = 50 + (relevance_score * 50)

        # Calculate distance from center (0-100 range, 0 being closest)
        distance = 100 - (relevance_score * 100)

        relevant_entities.append({
            **entity,
            'relevance': relevance_score,
            'card_size': card_size,
            'distance': distance
        })

    # Sort entities by relevance score in descending order
    relevant_entities.sort(key=lambda x: x['relevance'], reverse=True)

    return relevant_entities

def process_data(raw_data: Dict[str, Any], query: str) -> Dict[str, Any]:
    """
    Main function to process the data
    """
    cleaned_data = clean_data(raw_data)
    organized_data = prioritize_properties(cleaned_data)
    
    return {
        'query': query,
        'data': organized_data
    }


def process_related_entities(main_entity: Dict[str, Any], related_entities: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Process and calculate relevance for related entities, including the main entity
    """
    all_entities = calculate_relevance(main_entity, related_entities)
    
    return {
        'entities': all_entities
    }