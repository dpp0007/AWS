"""
ORD (Open Reaction Database) Processor
Converts chemistry reaction data into searchable vector embeddings
"""
import os
import json
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
from pathlib import Path

class ORDProcessor:
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.reactions = []
        self.index = None
        
    def create_sample_database(self):
        """Create a sample chemistry reactions database"""
        # Common high school chemistry reactions
        sample_reactions = [
            {
                "id": "rxn_001",
                "name": "Silver Chloride Precipitation",
                "equation": "NaCl + AgNO₃ → AgCl↓ + NaNO₃",
                "type": "precipitation",
                "description": "When sodium chloride reacts with silver nitrate, a white precipitate of silver chloride forms. This is a classic precipitation reaction used to test for chloride ions.",
                "reactants": ["NaCl", "AgNO₃"],
                "products": ["AgCl", "NaNO₃"],
                "observations": "White precipitate forms immediately",
                "mechanism": "Double displacement reaction where chloride ions from NaCl combine with silver ions from AgNO₃ to form insoluble AgCl"
            },
            {
                "id": "rxn_002",
                "name": "Copper Hydroxide Formation",
                "equation": "CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄",
                "type": "precipitation",
                "description": "Copper sulfate reacts with sodium hydroxide to form a blue gelatinous precipitate of copper hydroxide.",
                "reactants": ["CuSO₄", "NaOH"],
                "products": ["Cu(OH)₂", "Na₂SO₄"],
                "observations": "Blue gelatinous precipitate forms",
                "mechanism": "Hydroxide ions from NaOH react with copper ions to form insoluble copper hydroxide"
            },
            {
                "id": "rxn_003",
                "name": "Acid-Base Neutralization",
                "equation": "HCl + NaOH → NaCl + H₂O",
                "type": "neutralization",
                "description": "Hydrochloric acid neutralizes sodium hydroxide to form salt and water. This is an exothermic reaction.",
                "reactants": ["HCl", "NaOH"],
                "products": ["NaCl", "H₂O"],
                "observations": "Solution becomes warm, no visible change",
                "mechanism": "H⁺ ions from acid combine with OH⁻ ions from base to form water"
            },
            {
                "id": "rxn_004",
                "name": "SN2 Nucleophilic Substitution",
                "equation": "CH₃Br + OH⁻ → CH₃OH + Br⁻",
                "type": "substitution",
                "description": "A classic SN2 mechanism where hydroxide ion attacks methyl bromide from the backside, displacing bromide ion.",
                "reactants": ["CH₃Br", "OH⁻"],
                "products": ["CH₃OH", "Br⁻"],
                "observations": "Inversion of configuration occurs",
                "mechanism": "Backside attack by nucleophile, transition state with partial bonds, inversion of stereochemistry"
            },
            {
                "id": "rxn_005",
                "name": "Grignard Reaction",
                "equation": "RMgX + R'CHO → R'CH(OH)R",
                "type": "addition",
                "description": "Grignard reagents are powerful nucleophiles that add to carbonyl compounds to form alcohols.",
                "reactants": ["RMgX", "aldehyde"],
                "products": ["alcohol"],
                "observations": "Must be performed under anhydrous conditions",
                "mechanism": "Nucleophilic addition of Grignard reagent to carbonyl carbon, followed by protonation"
            },
            {
                "id": "rxn_006",
                "name": "Combustion of Methane",
                "equation": "CH₄ + 2O₂ → CO₂ + 2H₂O",
                "type": "combustion",
                "description": "Complete combustion of methane produces carbon dioxide and water, releasing energy.",
                "reactants": ["CH₄", "O₂"],
                "products": ["CO₂", "H₂O"],
                "observations": "Blue flame, heat and light produced",
                "mechanism": "Free radical chain reaction involving initiation, propagation, and termination steps"
            },
            {
                "id": "rxn_007",
                "name": "Esterification",
                "equation": "RCOOH + R'OH → RCOOR' + H₂O",
                "type": "condensation",
                "description": "Carboxylic acids react with alcohols in the presence of acid catalyst to form esters.",
                "reactants": ["carboxylic acid", "alcohol"],
                "products": ["ester", "water"],
                "observations": "Pleasant fruity smell often produced",
                "mechanism": "Nucleophilic acyl substitution with acid catalysis"
            },
            {
                "id": "rxn_008",
                "name": "Redox: Zinc and Copper",
                "equation": "Zn + Cu²⁺ → Zn²⁺ + Cu",
                "type": "redox",
                "description": "Zinc metal reduces copper ions, demonstrating electron transfer in redox reactions.",
                "reactants": ["Zn", "Cu²⁺"],
                "products": ["Zn²⁺", "Cu"],
                "observations": "Copper metal deposits on zinc surface",
                "mechanism": "Zinc is oxidized (loses electrons) while copper ions are reduced (gain electrons)"
            }
        ]
        
        self.reactions = sample_reactions
        print(f"Created sample database with {len(sample_reactions)} reactions")
        
    def build_index(self):
        """Build FAISS vector index from reactions"""
        if not self.reactions:
            self.create_sample_database()
        
        # Create text representations for embedding
        texts = []
        for rxn in self.reactions:
            text = f"{rxn['name']}. {rxn['description']} Equation: {rxn['equation']}. Mechanism: {rxn['mechanism']}"
            texts.append(text)
        
        # Generate embeddings
        print("Generating embeddings...")
        embeddings = self.model.encode(texts, show_progress_bar=True)
        
        # Create FAISS index
        dimension = embeddings.shape[1]
        self.index = faiss.IndexFlatL2(dimension)
        self.index.add(embeddings.astype('float32'))
        
        print(f"Built FAISS index with {self.index.ntotal} vectors")
        
    def save(self, index_path='ord_faiss.index', data_path='ord_reactions.json'):
        """Save index and reaction data"""
        if self.index is None:
            self.build_index()
        
        faiss.write_index(self.index, index_path)
        
        with open(data_path, 'w') as f:
            json.dump(self.reactions, f, indent=2)
        
        print(f"Saved index to {index_path} and data to {data_path}")
        
    def load(self, index_path='ord_faiss.index', data_path='ord_reactions.json'):
        """Load existing index and data"""
        if os.path.exists(index_path) and os.path.exists(data_path):
            self.index = faiss.read_index(index_path)
            with open(data_path, 'r') as f:
                self.reactions = json.load(f)
            print(f"Loaded {len(self.reactions)} reactions from disk")
            return True
        return False

if __name__ == "__main__":
    processor = ORDProcessor()
    
    # Try to load existing, otherwise create new
    if not processor.load():
        processor.create_sample_database()
        processor.build_index()
        processor.save()
    
    print("ORD database ready!")
