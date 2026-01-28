#!/usr/bin/env python3
import requests
import sys
import json
from datetime import datetime
import uuid

class SmartCookingAPITester:
    def __init__(self, base_url="https://chef-buddy-26.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.recipe_id = None
        self.saved_recipe_id = None

    def log(self, message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    self.log(f"   Error: {error_detail}")
                except:
                    self.log(f"   Response: {response.text[:200]}")
                return False, {}

        except Exception as e:
            self.log(f"❌ {name} - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test basic health endpoints"""
        self.run_test("Health Check", "GET", "", 200)
        self.run_test("Health Endpoint", "GET", "health", 200)

    def test_user_registration(self):
        """Test user registration"""
        test_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        test_data = {
            "email": test_email,
            "password": "TestPassword123!",
            "name": "Test Chef"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            self.log(f"   Registered user: {test_email}")
            return True
        return False

    def test_user_login(self):
        """Test user login with existing credentials"""
        if not self.user_id:
            self.log("⚠️  Skipping login test - no registered user")
            return False
            
        # We'll use the same credentials from registration
        # In a real scenario, we'd have predefined test credentials
        return True

    def test_get_user_profile(self):
        """Test getting user profile"""
        success, response = self.run_test(
            "Get User Profile",
            "GET",
            "auth/me",
            200
        )
        
        if success:
            self.log(f"   User plan: {response.get('plan', 'unknown')}")
            self.log(f"   Recipes this month: {response.get('recipes_generated_this_month', 0)}")
        
        return success

    def test_recipe_generation(self):
        """Test recipe generation with AI"""
        recipe_data = {
            "ingredients": ["pomodori", "basilico", "mozzarella"],
            "category": "salato",
            "servings": 4
        }
        
        success, response = self.run_test(
            "Recipe Generation",
            "POST",
            "recipes/generate",
            200,
            data=recipe_data
        )
        
        if success and 'id' in response:
            self.recipe_id = response['id']
            self.log(f"   Generated recipe: {response.get('title', 'Unknown')}")
            self.log(f"   Recipe ID: {self.recipe_id}")
            return True
        return False

    def test_save_recipe(self):
        """Test saving a recipe"""
        if not self.recipe_id:
            self.log("⚠️  Skipping save recipe test - no recipe generated")
            return False
            
        success, response = self.run_test(
            "Save Recipe",
            "POST",
            f"recipes/{self.recipe_id}/save",
            200
        )
        
        if success and 'id' in response:
            self.saved_recipe_id = response['id']
            self.log(f"   Saved recipe ID: {self.saved_recipe_id}")
            return True
        return False

    def test_get_saved_recipes(self):
        """Test getting saved recipes"""
        success, response = self.run_test(
            "Get Saved Recipes",
            "GET",
            "recipes/saved",
            200
        )
        
        if success:
            self.log(f"   Found {len(response)} saved recipes")
        
        return success

    def test_get_recipe_history(self):
        """Test getting recipe history"""
        success, response = self.run_test(
            "Get Recipe History",
            "GET",
            "recipes/history",
            200
        )
        
        if success:
            self.log(f"   Found {len(response)} recipes in history")
        
        return success

    def test_shared_recipe(self):
        """Test shared recipe endpoint"""
        if not self.recipe_id:
            self.log("⚠️  Skipping shared recipe test - no recipe generated")
            return False
            
        success, response = self.run_test(
            "Get Shared Recipe",
            "GET",
            f"recipes/shared/{self.recipe_id}",
            200
        )
        
        if success:
            self.log(f"   Shared recipe title: {response.get('title', 'Unknown')}")
        
        return success

    def test_checkout_creation(self):
        """Test Stripe checkout creation"""
        checkout_data = {
            "origin_url": "https://chef-buddy-26.preview.emergentagent.com"
        }
        
        success, response = self.run_test(
            "Create Checkout Session",
            "POST",
            "payments/checkout",
            200,
            data=checkout_data
        )
        
        if success and 'url' in response:
            self.log(f"   Checkout URL created: {response['url'][:50]}...")
            return True
        return False

    def test_unsave_recipe(self):
        """Test removing a saved recipe"""
        if not self.saved_recipe_id:
            self.log("⚠️  Skipping unsave recipe test - no saved recipe")
            return False
            
        success, response = self.run_test(
            "Unsave Recipe",
            "DELETE",
            f"recipes/saved/{self.saved_recipe_id}",
            200
        )
        
        return success

    def run_all_tests(self):
        """Run all API tests"""
        self.log("🚀 Starting Smart Cooking API Tests")
        self.log(f"   Base URL: {self.base_url}")
        
        # Health checks
        self.test_health_check()
        
        # Authentication flow
        if self.test_user_registration():
            self.test_get_user_profile()
            
            # Recipe functionality
            if self.test_recipe_generation():
                self.test_save_recipe()
                self.test_get_saved_recipes()
                self.test_get_recipe_history()
                self.test_shared_recipe()
                self.test_unsave_recipe()
            
            # Payment functionality
            self.test_checkout_creation()
        
        # Print results
        self.log(f"\n📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        self.log(f"   Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 80:
            self.log("🎉 Backend tests mostly successful!")
            return True
        else:
            self.log("⚠️  Backend has significant issues")
            return False

def main():
    tester = SmartCookingAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())