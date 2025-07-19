#!/usr/bin/env python3
"""
Backend Test Suite for Sistema Gestione Lista Elettorale
Tests all backend API endpoints with realistic Italian student election data
"""

import requests
import json
import uuid
from datetime import datetime
import os
import sys

# Get backend URL from frontend .env
BACKEND_URL = "https://46db30f0-d3c0-4a7d-aa7e-2482cd4324ca.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        self.auth_token = None
        self.test_user_id = None
        self.test_candidate_id = None
        
    def log_test(self, test_name, success, details=""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
        
    def test_server_status(self):
        """Test GET / endpoint"""
        try:
            response = self.session.get(f"{BACKEND_URL}/")
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "status" in data:
                    self.log_test("Server Status Check", True, f"Server running: {data['message']}")
                    return True
                else:
                    self.log_test("Server Status Check", False, "Missing required fields in response")
                    return False
            else:
                self.log_test("Server Status Check", False, f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Server Status Check", False, f"Connection error: {str(e)}")
            return False
    
    def test_user_registration(self):
        """Test POST /api/auth/register"""
        try:
            # Test data for Italian student election
            user_data = {
                "email": "marco.rossi@liceofermi.it",
                "password": "StudenteAttivo2024!",
                "name": "Marco Rossi",
                "role": "candidate"
            }
            
            response = self.session.post(f"{API_BASE}/auth/register", json=user_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "user" in data:
                    user = data["user"]
                    if all(key in user for key in ["id", "name", "email", "role", "token"]):
                        self.auth_token = user["token"]
                        self.test_user_id = user["id"]
                        self.log_test("User Registration", True, f"User registered: {user['name']}")
                        return True
                    else:
                        self.log_test("User Registration", False, "Missing user fields in response")
                        return False
                else:
                    self.log_test("User Registration", False, "Invalid response format")
                    return False
            else:
                self.log_test("User Registration", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("User Registration", False, f"Error: {str(e)}")
            return False
    
    def test_user_login(self):
        """Test POST /api/auth/login"""
        try:
            login_data = {
                "email": "marco.rossi@liceofermi.it",
                "password": "StudenteAttivo2024!"
            }
            
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "user" in data:
                    user = data["user"]
                    if "token" in user:
                        self.auth_token = user["token"]
                        self.log_test("User Login", True, f"Login successful for {user['name']}")
                        return True
                    else:
                        self.log_test("User Login", False, "No token in response")
                        return False
                else:
                    self.log_test("User Login", False, "Invalid response format")
                    return False
            else:
                self.log_test("User Login", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("User Login", False, f"Error: {str(e)}")
            return False
    
    def test_create_candidate(self):
        """Test POST /api/candidates"""
        try:
            candidate_data = {
                "user_id": self.test_user_id,
                "name": "Marco Rossi",
                "class_year": "5A Scientifico",
                "description": "Studente del quinto anno, rappresentante di classe da 3 anni. Appassionato di tecnologia e sostenibilità ambientale.",
                "manifesto": "Per una scuola più digitale, sostenibile e inclusiva!"
            }
            
            response = self.session.post(f"{API_BASE}/candidates", json=candidate_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "candidate" in data:
                    candidate = data["candidate"]
                    if "id" in candidate:
                        self.test_candidate_id = candidate["id"]
                        self.log_test("Create Candidate", True, f"Candidate created: {candidate['name']}")
                        return True
                    else:
                        self.log_test("Create Candidate", False, "No candidate ID in response")
                        return False
                else:
                    self.log_test("Create Candidate", False, "Invalid response format")
                    return False
            else:
                self.log_test("Create Candidate", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Create Candidate", False, f"Error: {str(e)}")
            return False
    
    def test_get_candidates(self):
        """Test GET /api/candidates"""
        try:
            response = self.session.get(f"{API_BASE}/candidates")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "candidates" in data:
                    candidates = data["candidates"]
                    if isinstance(candidates, list):
                        self.log_test("Get Candidates", True, f"Retrieved {len(candidates)} candidates")
                        return True
                    else:
                        self.log_test("Get Candidates", False, "Candidates is not a list")
                        return False
                else:
                    self.log_test("Get Candidates", False, "Invalid response format")
                    return False
            else:
                self.log_test("Get Candidates", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Get Candidates", False, f"Error: {str(e)}")
            return False
    
    def test_get_candidate_by_id(self):
        """Test GET /api/candidates/{id}"""
        if not self.test_candidate_id:
            self.log_test("Get Candidate by ID", False, "No candidate ID available")
            return False
            
        try:
            response = self.session.get(f"{API_BASE}/candidates/{self.test_candidate_id}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "candidate" in data:
                    candidate = data["candidate"]
                    if candidate.get("id") == self.test_candidate_id:
                        self.log_test("Get Candidate by ID", True, f"Retrieved candidate: {candidate['name']}")
                        return True
                    else:
                        self.log_test("Get Candidate by ID", False, "Wrong candidate returned")
                        return False
                else:
                    self.log_test("Get Candidate by ID", False, "Invalid response format")
                    return False
            else:
                self.log_test("Get Candidate by ID", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Get Candidate by ID", False, f"Error: {str(e)}")
            return False
    
    def test_create_campaign(self):
        """Test POST /api/campaigns"""
        if not self.test_candidate_id:
            self.log_test("Create Campaign", False, "No candidate ID available")
            return False
            
        try:
            campaign_data = {
                "candidate_id": self.test_candidate_id,
                "title": "Campagna per il Cambiamento - Marco Rossi 2024",
                "description": "Una campagna incentrata su digitalizzazione, sostenibilità e inclusione per il nostro liceo.",
                "status": "active",
                "events": [
                    {
                        "name": "Assemblea di presentazione",
                        "date": "2024-03-15",
                        "location": "Aula Magna"
                    }
                ],
                "materials": [
                    {
                        "type": "volantino",
                        "title": "Il nostro programma",
                        "description": "Volantino con le proposte principali"
                    }
                ]
            }
            
            response = self.session.post(f"{API_BASE}/campaigns", json=campaign_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "campaign" in data:
                    campaign = data["campaign"]
                    if "id" in campaign:
                        self.log_test("Create Campaign", True, f"Campaign created: {campaign['title']}")
                        return True
                    else:
                        self.log_test("Create Campaign", False, "No campaign ID in response")
                        return False
                else:
                    self.log_test("Create Campaign", False, "Invalid response format")
                    return False
            else:
                self.log_test("Create Campaign", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Create Campaign", False, f"Error: {str(e)}")
            return False
    
    def test_get_candidate_campaigns(self):
        """Test GET /api/campaigns/{candidate_id}"""
        if not self.test_candidate_id:
            self.log_test("Get Candidate Campaigns", False, "No candidate ID available")
            return False
            
        try:
            response = self.session.get(f"{API_BASE}/campaigns/{self.test_candidate_id}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "campaigns" in data:
                    campaigns = data["campaigns"]
                    if isinstance(campaigns, list):
                        self.log_test("Get Candidate Campaigns", True, f"Retrieved {len(campaigns)} campaigns")
                        return True
                    else:
                        self.log_test("Get Candidate Campaigns", False, "Campaigns is not a list")
                        return False
                else:
                    self.log_test("Get Candidate Campaigns", False, "Invalid response format")
                    return False
            else:
                self.log_test("Get Candidate Campaigns", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Get Candidate Campaigns", False, f"Error: {str(e)}")
            return False
    
    def test_generate_ai_program(self):
        """Test POST /api/generate-program - THE KILLER FEATURE!"""
        try:
            program_request = {
                "candidate_name": "Marco Rossi",
                "class_year": "5A Scientifico",
                "main_issues": [
                    "Digitalizzazione della didattica",
                    "Sostenibilità ambientale",
                    "Spazi comuni per gli studenti",
                    "Miglioramento mensa scolastica",
                    "Attività extracurriculari"
                ],
                "personal_values": [
                    "Inclusione",
                    "Innovazione",
                    "Trasparenza",
                    "Collaborazione"
                ],
                "school_context": "Liceo Scientifico Enrico Fermi di Milano, 1200 studenti, edificio storico con necessità di modernizzazione tecnologica e spazi verdi limitati."
            }
            
            response = self.session.post(f"{API_BASE}/generate-program", json=program_request)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "program" in data:
                    program = data["program"]
                    if "content" in program and len(program["content"]) > 100:
                        self.log_test("AI Program Generation", True, f"Generated program ({len(program['content'])} chars)")
                        return True
                    else:
                        self.log_test("AI Program Generation", False, "Generated content too short or missing")
                        return False
                else:
                    self.log_test("AI Program Generation", False, "Invalid response format")
                    return False
            else:
                self.log_test("AI Program Generation", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("AI Program Generation", False, f"Error: {str(e)}")
            return False
    
    def test_save_program(self):
        """Test POST /api/programs"""
        if not self.test_candidate_id:
            self.log_test("Save Program", False, "No candidate ID available")
            return False
            
        try:
            program_data = {
                "candidate_id": self.test_candidate_id,
                "title": "Programma Elettorale - Marco Rossi 2024",
                "content": """
# PROGRAMMA ELETTORALE - MARCO ROSSI
## Per una scuola più digitale, sostenibile e inclusiva

### CHI SONO
Sono Marco Rossi, studente della 5A Scientifico, rappresentante di classe da tre anni e appassionato di tecnologia e sostenibilità.

### LA MIA VISIONE
Voglio trasformare il nostro liceo in un ambiente moderno, inclusivo e sostenibile dove ogni studente possa esprimere il proprio potenziale.

### LE MIE PROPOSTE

1. **DIGITALIZZAZIONE SMART**
   - Implementazione di piattaforme digitali integrate
   - Wi-Fi potenziato in tutta la scuola
   - Tablet e strumenti digitali per tutti

2. **SOSTENIBILITÀ AMBIENTALE**
   - Raccolta differenziata avanzata
   - Giardino scolastico gestito dagli studenti
   - Pannelli solari per l'autosufficienza energetica

3. **SPAZI COMUNI RINNOVATI**
   - Area relax con divani e tavoli da studio
   - Sala musica insonorizzata
   - Spazio coworking per progetti di gruppo

4. **MENSA MIGLIORATA**
   - Menu più vario con opzioni vegane
   - Prodotti locali e biologici
   - Sistema di feedback continuo

5. **ATTIVITÀ EXTRACURRICULARI**
   - Club di robotica e coding
   - Tornei sportivi inter-classe
   - Laboratori creativi pomeridiani

### INSIEME POSSIAMO FARCELA!
Con il vostro supporto, realizzeremo questi cambiamenti per una scuola migliore per tutti.

**#MarcoPerIlCambiamento #LiceoFermi2024**
                """,
                "generated_by_ai": False
            }
            
            response = self.session.post(f"{API_BASE}/programs", json=program_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "program" in data:
                    program = data["program"]
                    if "id" in program:
                        self.log_test("Save Program", True, f"Program saved: {program['title']}")
                        return True
                    else:
                        self.log_test("Save Program", False, "No program ID in response")
                        return False
                else:
                    self.log_test("Save Program", False, "Invalid response format")
                    return False
            else:
                self.log_test("Save Program", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Save Program", False, f"Error: {str(e)}")
            return False
    
    def test_get_candidate_programs(self):
        """Test GET /api/programs/{candidate_id}"""
        if not self.test_candidate_id:
            self.log_test("Get Candidate Programs", False, "No candidate ID available")
            return False
            
        try:
            response = self.session.get(f"{API_BASE}/programs/{self.test_candidate_id}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "programs" in data:
                    programs = data["programs"]
                    if isinstance(programs, list):
                        self.log_test("Get Candidate Programs", True, f"Retrieved {len(programs)} programs")
                        return True
                    else:
                        self.log_test("Get Candidate Programs", False, "Programs is not a list")
                        return False
                else:
                    self.log_test("Get Candidate Programs", False, "Invalid response format")
                    return False
            else:
                self.log_test("Get Candidate Programs", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Get Candidate Programs", False, f"Error: {str(e)}")
            return False
    
    def test_dashboard_stats(self):
        """Test GET /api/dashboard/stats"""
        try:
            response = self.session.get(f"{API_BASE}/dashboard/stats")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "stats" in data:
                    stats = data["stats"]
                    required_stats = ["total_candidates", "total_campaigns", "active_campaigns", "total_programs"]
                    if all(stat in stats for stat in required_stats):
                        self.log_test("Dashboard Stats", True, f"Stats: {stats}")
                        return True
                    else:
                        self.log_test("Dashboard Stats", False, "Missing required stats")
                        return False
                else:
                    self.log_test("Dashboard Stats", False, "Invalid response format")
                    return False
            else:
                self.log_test("Dashboard Stats", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Dashboard Stats", False, f"Error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend tests in sequence"""
        print("🚀 Starting Backend API Tests for Sistema Gestione Lista Elettorale")
        print(f"🔗 Testing against: {BACKEND_URL}")
        print("=" * 80)
        
        # Test sequence
        tests = [
            ("Server Status", self.test_server_status),
            ("User Registration", self.test_user_registration),
            ("User Login", self.test_user_login),
            ("Create Candidate", self.test_create_candidate),
            ("Get Candidates", self.test_get_candidates),
            ("Get Candidate by ID", self.test_get_candidate_by_id),
            ("Create Campaign", self.test_create_campaign),
            ("Get Candidate Campaigns", self.test_get_candidate_campaigns),
            ("AI Program Generation", self.test_generate_ai_program),
            ("Save Program", self.test_save_program),
            ("Get Candidate Programs", self.test_get_candidate_programs),
            ("Dashboard Stats", self.test_dashboard_stats)
        ]
        
        for test_name, test_func in tests:
            print(f"\n🧪 Running: {test_name}")
            test_func()
        
        # Summary
        print("\n" + "=" * 80)
        print("📊 TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"✅ Passed: {passed}/{total}")
        print(f"❌ Failed: {total - passed}/{total}")
        
        if passed == total:
            print("🎉 ALL TESTS PASSED! Backend is working correctly.")
        else:
            print("⚠️  Some tests failed. Check details above.")
            
        return passed == total

def main():
    """Main test runner"""
    tester = BackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()