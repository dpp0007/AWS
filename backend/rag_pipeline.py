"""
RAG (Retrieval Augmented Generation) Pipeline
Retrieves relevant chemistry reactions and augments LLM responses
"""
import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from typing import List, Dict

class ChemistryRAG:
    def __init__(self, index_path='ord_faiss.index', data_path='ord_reactions.json'):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.index = None
        self.reactions = []
        self.load(index_path, data_path)
    
    def load(self, index_path, data_path):
        """Load FAISS index and reaction data"""
        try:
            self.index = faiss.read_index(index_path)
            with open(data_path, 'r') as f:
                self.reactions = json.load(f)
            print(f"✓ RAG loaded: {len(self.reactions)} reactions indexed")
        except FileNotFoundError:
            print(f"⚠ RAG database files not found")
            print(f"  Run 'python ord_processor.py' to create the database")
            print(f"  Backend will work without RAG enhancement")
            self.index = None
            self.reactions = []
        except Exception as e:
            print(f"⚠ Could not load RAG data: {e}")
            print("  Backend will work without RAG enhancement")
            self.index = None
            self.reactions = []
    
    def retrieve_context(self, query: str, k: int = 3) -> str:
        """Retrieve top-k relevant reactions for a query"""
        if self.index is None or not self.reactions:
            return "No reaction database available."
        
        # Encode query
        query_embedding = self.model.encode([query])[0]
        
        # Search FAISS index
        distances, indices = self.index.search(
            np.array([query_embedding]).astype('float32'), 
            k
        )
        
        # Format context
        context_parts = []
        for idx in indices[0]:
            if idx < len(self.reactions):
                rxn = self.reactions[idx]
                context_parts.append(
                    f"Reaction: {rxn['name']}\n"
                    f"Equation: {rxn['equation']}\n"
                    f"Type: {rxn['type']}\n"
                    f"Description: {rxn['description']}\n"
                    f"Mechanism: {rxn['mechanism']}\n"
                )
        
        return "\n---\n".join(context_parts) if context_parts else "No relevant reactions found."
    
    def get_reaction_by_chemicals(self, chemicals: List[str]) -> Dict:
        """Find reactions involving specific chemicals"""
        for rxn in self.reactions:
            reactants = [r.lower() for r in rxn.get('reactants', [])]
            if any(chem.lower() in reactants for chem in chemicals):
                return rxn
        return None
