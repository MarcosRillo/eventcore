# 🔍 BACKEND AUDIT REPORT
**Generated:** $(date)
**Platform:** Laravel + PostgreSQL
**Purpose:** Comprehensive backend analysis

---

## 📊 EXECUTIVE SUMMARY

**PHP Version:** 8.4.7
**Laravel Version:** 12.24.0

## 📦 DEPENDENCIES

```json
84
```

## 🗄️ DATABASE

**Migrations:**       20

**Models:**       13

```
Category.php
CustomField.php
Event.php
EventStatus.php
EventType.php
Location.php
Organization.php
OrganizationStatus.php
OrganizationType.php
Scopes/TenantScope.php
Section.php
User.php
UserRole.php
```

## 🏗️ ARCHITECTURE

**Type:** Features-based ✅

**Features:**
```
Appearance
Approval
Auth
Categories
Dashboard
Events
Locations
Organizer
PublicEvents
```

**Controllers:**       10
**Services:**        7
**Tests:**        0

## 🛣️ ROUTES

```

                                          
  The "--compact" option does not exist.  
                                          

```

## 🧪 TESTS

```

  ..⨯⨯⨯⨯⨯⨯⨯⨯⨯⨯⨯⨯⨯⨯⨯⨯⨯⨯⨯⨯⨯⨯⨯⨯⨯⨯⨯⨯.⨯⨯⨯⨯⨯
  ────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\ApprovalTest > can reject event       QueryException   
  SQLSTATE[HY000]: General error: 1 no such table: user_roles (Connection: sqlite, SQL: insert into "user_roles" ("created_at", "description", "permissions", "role_code", "role_name", "updated_at") values (2025-10-29 13:25:54, Full access to platform configuration and all organizations, ["manage_platform","manage_organizations","manage_users","view_all_events"], platform_admin, Platform Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Administrator of a primary entity (government, municipality), ["manage_entity_events","approve_events","manage_entity_users","view_analytics"], entity_admin, Entity Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Staff member of a primary entity with limited permissions, ["create_events","edit_own_events","view_entity_events"], entity_staff, Entity Staff, 2025-10-29 13:25:54), (2025-10-29 13:25:54, External organizer who can create and manage their own events, ["create_events","manage_own_events","view_own_analytics"], organizer_admin, Event Organizer, 2025-10-29 13:25:54))

  at vendor/laravel/framework/src/Illuminate/Database/Connection.php:824
    820▕                     $this->getName(), $query, $this->prepareBindings($bindings), $e
    821▕                 );
    822▕             }
    823▕ 
  ➜ 824▕             throw new QueryException(
    825▕                 $this->getName(), $query, $this->prepareBindings($bindings), $e
    826▕             );
    827▕         }
    828▕     }

      [2m+8 vendor frames [22m
  9   database/seeders/UserRolesSeeder.php:69
      [2m+23 vendor frames [22m
  33  tests/Feature/ApprovalTest.php:20

  ────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\ApprovalTest > can request changes…   QueryException   
  SQLSTATE[HY000]: General error: 1 no such table: user_roles (Connection: sqlite, SQL: insert into "user_roles" ("created_at", "description", "permissions", "role_code", "role_name", "updated_at") values (2025-10-29 13:25:54, Full access to platform configuration and all organizations, ["manage_platform","manage_organizations","manage_users","view_all_events"], platform_admin, Platform Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Administrator of a primary entity (government, municipality), ["manage_entity_events","approve_events","manage_entity_users","view_analytics"], entity_admin, Entity Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Staff member of a primary entity with limited permissions, ["create_events","edit_own_events","view_entity_events"], entity_staff, Entity Staff, 2025-10-29 13:25:54), (2025-10-29 13:25:54, External organizer who can create and manage their own events, ["create_events","manage_own_events","view_own_analytics"], organizer_admin, Event Organizer, 2025-10-29 13:25:54))

  at vendor/laravel/framework/src/Illuminate/Database/Connection.php:824
    820▕                     $this->getName(), $query, $this->prepareBindings($bindings), $e
    821▕                 );
    822▕             }
    823▕ 
  ➜ 824▕             throw new QueryException(
    825▕                 $this->getName(), $query, $this->prepareBindings($bindings), $e
    826▕             );
    827▕         }
    828▕     }

      [2m+8 vendor frames [22m
  9   database/seeders/UserRolesSeeder.php:69
      [2m+23 vendor frames [22m
  33  tests/Feature/ApprovalTest.php:20

  ────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\ApprovalTest > can publish approved…  QueryException   
  SQLSTATE[HY000]: General error: 1 no such table: user_roles (Connection: sqlite, SQL: insert into "user_roles" ("created_at", "description", "permissions", "role_code", "role_name", "updated_at") values (2025-10-29 13:25:54, Full access to platform configuration and all organizations, ["manage_platform","manage_organizations","manage_users","view_all_events"], platform_admin, Platform Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Administrator of a primary entity (government, municipality), ["manage_entity_events","approve_events","manage_entity_users","view_analytics"], entity_admin, Entity Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Staff member of a primary entity with limited permissions, ["create_events","edit_own_events","view_entity_events"], entity_staff, Entity Staff, 2025-10-29 13:25:54), (2025-10-29 13:25:54, External organizer who can create and manage their own events, ["create_events","manage_own_events","view_own_analytics"], organizer_admin, Event Organizer, 2025-10-29 13:25:54))

  at vendor/laravel/framework/src/Illuminate/Database/Connection.php:824
    820▕                     $this->getName(), $query, $this->prepareBindings($bindings), $e
    821▕                 );
    822▕             }
    823▕ 
  ➜ 824▕             throw new QueryException(
    825▕                 $this->getName(), $query, $this->prepareBindings($bindings), $e
    826▕             );
    827▕         }
    828▕     }

      [2m+8 vendor frames [22m
  9   database/seeders/UserRolesSeeder.php:69
      [2m+23 vendor frames [22m
  33  tests/Feature/ApprovalTest.php:20

  ────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\ApprovalTest > can request public v…  QueryException   
  SQLSTATE[HY000]: General error: 1 no such table: user_roles (Connection: sqlite, SQL: insert into "user_roles" ("created_at", "description", "permissions", "role_code", "role_name", "updated_at") values (2025-10-29 13:25:54, Full access to platform configuration and all organizations, ["manage_platform","manage_organizations","manage_users","view_all_events"], platform_admin, Platform Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Administrator of a primary entity (government, municipality), ["manage_entity_events","approve_events","manage_entity_users","view_analytics"], entity_admin, Entity Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Staff member of a primary entity with limited permissions, ["create_events","edit_own_events","view_entity_events"], entity_staff, Entity Staff, 2025-10-29 13:25:54), (2025-10-29 13:25:54, External organizer who can create and manage their own events, ["create_events","manage_own_events","view_own_analytics"], organizer_admin, Event Organizer, 2025-10-29 13:25:54))

  at vendor/laravel/framework/src/Illuminate/Database/Connection.php:824
    820▕                     $this->getName(), $query, $this->prepareBindings($bindings), $e
    821▕                 );
    822▕             }
    823▕ 
  ➜ 824▕             throw new QueryException(
    825▕                 $this->getName(), $query, $this->prepareBindings($bindings), $e
    826▕             );
    827▕         }
    828▕     }

      [2m+8 vendor frames [22m
  9   database/seeders/UserRolesSeeder.php:69
      [2m+23 vendor frames [22m
  33  tests/Feature/ApprovalTest.php:20

  ────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\ApprovalTest > can get approval sta…  QueryException   
  SQLSTATE[HY000]: General error: 1 no such table: user_roles (Connection: sqlite, SQL: insert into "user_roles" ("created_at", "description", "permissions", "role_code", "role_name", "updated_at") values (2025-10-29 13:25:54, Full access to platform configuration and all organizations, ["manage_platform","manage_organizations","manage_users","view_all_events"], platform_admin, Platform Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Administrator of a primary entity (government, municipality), ["manage_entity_events","approve_events","manage_entity_users","view_analytics"], entity_admin, Entity Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Staff member of a primary entity with limited permissions, ["create_events","edit_own_events","view_entity_events"], entity_staff, Entity Staff, 2025-10-29 13:25:54), (2025-10-29 13:25:54, External organizer who can create and manage their own events, ["create_events","manage_own_events","view_own_analytics"], organizer_admin, Event Organizer, 2025-10-29 13:25:54))

  at vendor/laravel/framework/src/Illuminate/Database/Connection.php:824
    820▕                     $this->getName(), $query, $this->prepareBindings($bindings), $e
    821▕                 );
    822▕             }
    823▕ 
  ➜ 824▕             throw new QueryException(
    825▕                 $this->getName(), $query, $this->prepareBindings($bindings), $e
    826▕             );
    827▕         }
    828▕     }

      [2m+8 vendor frames [22m
  9   database/seeders/UserRolesSeeder.php:69
      [2m+23 vendor frames [22m
  33  tests/Feature/ApprovalTest.php:20

  ────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\CategoryTest > can list categories    QueryException   
  SQLSTATE[HY000]: General error: 1 no such table: user_roles (Connection: sqlite, SQL: insert into "user_roles" ("created_at", "description", "permissions", "role_code", "role_name", "updated_at") values (2025-10-29 13:25:54, Full access to platform configuration and all organizations, ["manage_platform","manage_organizations","manage_users","view_all_events"], platform_admin, Platform Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Administrator of a primary entity (government, municipality), ["manage_entity_events","approve_events","manage_entity_users","view_analytics"], entity_admin, Entity Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Staff member of a primary entity with limited permissions, ["create_events","edit_own_events","view_entity_events"], entity_staff, Entity Staff, 2025-10-29 13:25:54), (2025-10-29 13:25:54, External organizer who can create and manage their own events, ["create_events","manage_own_events","view_own_analytics"], organizer_admin, Event Organizer, 2025-10-29 13:25:54))

  at vendor/laravel/framework/src/Illuminate/Database/Connection.php:824
    820▕                     $this->getName(), $query, $this->prepareBindings($bindings), $e
    821▕                 );
    822▕             }
    823▕ 
  ➜ 824▕             throw new QueryException(
    825▕                 $this->getName(), $query, $this->prepareBindings($bindings), $e
    826▕             );
    827▕         }
    828▕     }

      [2m+8 vendor frames [22m
  9   database/seeders/UserRolesSeeder.php:69
      [2m+23 vendor frames [22m
  33  tests/Feature/CategoryTest.php:22

  ────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\CategoryTest > can create category    QueryException   
  SQLSTATE[HY000]: General error: 1 no such table: user_roles (Connection: sqlite, SQL: insert into "user_roles" ("created_at", "description", "permissions", "role_code", "role_name", "updated_at") values (2025-10-29 13:25:54, Full access to platform configuration and all organizations, ["manage_platform","manage_organizations","manage_users","view_all_events"], platform_admin, Platform Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Administrator of a primary entity (government, municipality), ["manage_entity_events","approve_events","manage_entity_users","view_analytics"], entity_admin, Entity Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Staff member of a primary entity with limited permissions, ["create_events","edit_own_events","view_entity_events"], entity_staff, Entity Staff, 2025-10-29 13:25:54), (2025-10-29 13:25:54, External organizer who can create and manage their own events, ["create_events","manage_own_events","view_own_analytics"], organizer_admin, Event Organizer, 2025-10-29 13:25:54))

  at vendor/laravel/framework/src/Illuminate/Database/Connection.php:824
    820▕                     $this->getName(), $query, $this->prepareBindings($bindings), $e
    821▕                 );
    822▕             }
    823▕ 
  ➜ 824▕             throw new QueryException(
    825▕                 $this->getName(), $query, $this->prepareBindings($bindings), $e
    826▕             );
    827▕         }
    828▕     }

      [2m+8 vendor frames [22m
  9   database/seeders/UserRolesSeeder.php:69
      [2m+23 vendor frames [22m
  33  tests/Feature/CategoryTest.php:22

  ────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\CategoryTest > can update category    QueryException   
  SQLSTATE[HY000]: General error: 1 no such table: user_roles (Connection: sqlite, SQL: insert into "user_roles" ("created_at", "description", "permissions", "role_code", "role_name", "updated_at") values (2025-10-29 13:25:54, Full access to platform configuration and all organizations, ["manage_platform","manage_organizations","manage_users","view_all_events"], platform_admin, Platform Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Administrator of a primary entity (government, municipality), ["manage_entity_events","approve_events","manage_entity_users","view_analytics"], entity_admin, Entity Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Staff member of a primary entity with limited permissions, ["create_events","edit_own_events","view_entity_events"], entity_staff, Entity Staff, 2025-10-29 13:25:54), (2025-10-29 13:25:54, External organizer who can create and manage their own events, ["create_events","manage_own_events","view_own_analytics"], organizer_admin, Event Organizer, 2025-10-29 13:25:54))

  at vendor/laravel/framework/src/Illuminate/Database/Connection.php:824
    820▕                     $this->getName(), $query, $this->prepareBindings($bindings), $e
    821▕                 );
    822▕             }
    823▕ 
  ➜ 824▕             throw new QueryException(
    825▕                 $this->getName(), $query, $this->prepareBindings($bindings), $e
    826▕             );
    827▕         }
    828▕     }

      [2m+8 vendor frames [22m
  9   database/seeders/UserRolesSeeder.php:69
      [2m+23 vendor frames [22m
  33  tests/Feature/CategoryTest.php:22

  ────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\CategoryTest > can delete category    QueryException   
  SQLSTATE[HY000]: General error: 1 no such table: user_roles (Connection: sqlite, SQL: insert into "user_roles" ("created_at", "description", "permissions", "role_code", "role_name", "updated_at") values (2025-10-29 13:25:54, Full access to platform configuration and all organizations, ["manage_platform","manage_organizations","manage_users","view_all_events"], platform_admin, Platform Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Administrator of a primary entity (government, municipality), ["manage_entity_events","approve_events","manage_entity_users","view_analytics"], entity_admin, Entity Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Staff member of a primary entity with limited permissions, ["create_events","edit_own_events","view_entity_events"], entity_staff, Entity Staff, 2025-10-29 13:25:54), (2025-10-29 13:25:54, External organizer who can create and manage their own events, ["create_events","manage_own_events","view_own_analytics"], organizer_admin, Event Organizer, 2025-10-29 13:25:54))

  at vendor/laravel/framework/src/Illuminate/Database/Connection.php:824
    820▕                     $this->getName(), $query, $this->prepareBindings($bindings), $e
    821▕                 );
    822▕             }
    823▕ 
  ➜ 824▕             throw new QueryException(
    825▕                 $this->getName(), $query, $this->prepareBindings($bindings), $e
    826▕             );
    827▕         }
    828▕     }

      [2m+8 vendor frames [22m
  9   database/seeders/UserRolesSeeder.php:69
      [2m+23 vendor frames [22m
  33  tests/Feature/CategoryTest.php:22

  ────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\CategoryTest > can get active categ…  QueryException   
  SQLSTATE[HY000]: General error: 1 no such table: user_roles (Connection: sqlite, SQL: insert into "user_roles" ("created_at", "description", "permissions", "role_code", "role_name", "updated_at") values (2025-10-29 13:25:54, Full access to platform configuration and all organizations, ["manage_platform","manage_organizations","manage_users","view_all_events"], platform_admin, Platform Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Administrator of a primary entity (government, municipality), ["manage_entity_events","approve_events","manage_entity_users","view_analytics"], entity_admin, Entity Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Staff member of a primary entity with limited permissions, ["create_events","edit_own_events","view_entity_events"], entity_staff, Entity Staff, 2025-10-29 13:25:54), (2025-10-29 13:25:54, External organizer who can create and manage their own events, ["create_events","manage_own_events","view_own_analytics"], organizer_admin, Event Organizer, 2025-10-29 13:25:54))

  at vendor/laravel/framework/src/Illuminate/Database/Connection.php:824
    820▕                     $this->getName(), $query, $this->prepareBindings($bindings), $e
    821▕                 );
    822▕             }
    823▕ 
  ➜ 824▕             throw new QueryException(
    825▕                 $this->getName(), $query, $this->prepareBindings($bindings), $e
    826▕             );
    827▕         }
    828▕     }

      [2m+8 vendor frames [22m
  9   database/seeders/UserRolesSeeder.php:69
      [2m+23 vendor frames [22m
  33  tests/Feature/CategoryTest.php:22

  ────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\Dashboard\OrganizerStatsTest > retu…  QueryException   
  SQLSTATE[HY000]: General error: 1 no such table: user_roles (Connection: sqlite, SQL: insert into "user_roles" ("created_at", "description", "permissions", "role_code", "role_name", "updated_at") values (2025-10-29 13:25:54, Full access to platform configuration and all organizations, ["manage_platform","manage_organizations","manage_users","view_all_events"], platform_admin, Platform Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Administrator of a primary entity (government, municipality), ["manage_entity_events","approve_events","manage_entity_users","view_analytics"], entity_admin, Entity Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Staff member of a primary entity with limited permissions, ["create_events","edit_own_events","view_entity_events"], entity_staff, Entity Staff, 2025-10-29 13:25:54), (2025-10-29 13:25:54, External organizer who can create and manage their own events, ["create_events","manage_own_events","view_own_analytics"], organizer_admin, Event Organizer, 2025-10-29 13:25:54))

  at vendor/laravel/framework/src/Illuminate/Database/Connection.php:824
    820▕                     $this->getName(), $query, $this->prepareBindings($bindings), $e
    821▕                 );
    822▕             }
    823▕ 
  ➜ 824▕             throw new QueryException(
    825▕                 $this->getName(), $query, $this->prepareBindings($bindings), $e
    826▕             );
    827▕         }
    828▕     }

      [2m+8 vendor frames [22m
  9   database/seeders/UserRolesSeeder.php:69
      [2m+23 vendor frames [22m
  33  tests/Feature/Dashboard/OrganizerStatsTest.php:22

  ────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\Dashboard\OrganizerStatsTest > retu…  QueryException   
  SQLSTATE[HY000]: General error: 1 no such table: user_roles (Connection: sqlite, SQL: insert into "user_roles" ("created_at", "description", "permissions", "role_code", "role_name", "updated_at") values (2025-10-29 13:25:54, Full access to platform configuration and all organizations, ["manage_platform","manage_organizations","manage_users","view_all_events"], platform_admin, Platform Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Administrator of a primary entity (government, municipality), ["manage_entity_events","approve_events","manage_entity_users","view_analytics"], entity_admin, Entity Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Staff member of a primary entity with limited permissions, ["create_events","edit_own_events","view_entity_events"], entity_staff, Entity Staff, 2025-10-29 13:25:54), (2025-10-29 13:25:54, External organizer who can create and manage their own events, ["create_events","manage_own_events","view_own_analytics"], organizer_admin, Event Organizer, 2025-10-29 13:25:54))

  at vendor/laravel/framework/src/Illuminate/Database/Connection.php:824
    820▕                     $this->getName(), $query, $this->prepareBindings($bindings), $e
    821▕                 );
    822▕             }
    823▕ 
  ➜ 824▕             throw new QueryException(
    825▕                 $this->getName(), $query, $this->prepareBindings($bindings), $e
    826▕             );
    827▕         }
    828▕     }

      [2m+8 vendor frames [22m
  9   database/seeders/UserRolesSeeder.php:69
      [2m+23 vendor frames [22m
  33  tests/Feature/Dashboard/OrganizerStatsTest.php:22

  ────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\Dashboard\OrganizerStatsTest > only…  QueryException   
  SQLSTATE[HY000]: General error: 1 no such table: user_roles (Connection: sqlite, SQL: insert into "user_roles" ("created_at", "description", "permissions", "role_code", "role_name", "updated_at") values (2025-10-29 13:25:54, Full access to platform configuration and all organizations, ["manage_platform","manage_organizations","manage_users","view_all_events"], platform_admin, Platform Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Administrator of a primary entity (government, municipality), ["manage_entity_events","approve_events","manage_entity_users","view_analytics"], entity_admin, Entity Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Staff member of a primary entity with limited permissions, ["create_events","edit_own_events","view_entity_events"], entity_staff, Entity Staff, 2025-10-29 13:25:54), (2025-10-29 13:25:54, External organizer who can create and manage their own events, ["create_events","manage_own_events","view_own_analytics"], organizer_admin, Event Organizer, 2025-10-29 13:25:54))

  at vendor/laravel/framework/src/Illuminate/Database/Connection.php:824
    820▕                     $this->getName(), $query, $this->prepareBindings($bindings), $e
    821▕                 );
    822▕             }
    823▕ 
  ➜ 824▕             throw new QueryException(
    825▕                 $this->getName(), $query, $this->prepareBindings($bindings), $e
    826▕             );
    827▕         }
    828▕     }

      [2m+8 vendor frames [22m
  9   database/seeders/UserRolesSeeder.php:69
      [2m+23 vendor frames [22m
  33  tests/Feature/Dashboard/OrganizerStatsTest.php:22

  ────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\Dashboard\OrganizerStatsTest > retu…  QueryException   
  SQLSTATE[HY000]: General error: 1 no such table: user_roles (Connection: sqlite, SQL: insert into "user_roles" ("created_at", "description", "permissions", "role_code", "role_name", "updated_at") values (2025-10-29 13:25:54, Full access to platform configuration and all organizations, ["manage_platform","manage_organizations","manage_users","view_all_events"], platform_admin, Platform Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Administrator of a primary entity (government, municipality), ["manage_entity_events","approve_events","manage_entity_users","view_analytics"], entity_admin, Entity Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Staff member of a primary entity with limited permissions, ["create_events","edit_own_events","view_entity_events"], entity_staff, Entity Staff, 2025-10-29 13:25:54), (2025-10-29 13:25:54, External organizer who can create and manage their own events, ["create_events","manage_own_events","view_own_analytics"], organizer_admin, Event Organizer, 2025-10-29 13:25:54))

  at vendor/laravel/framework/src/Illuminate/Database/Connection.php:824
    820▕                     $this->getName(), $query, $this->prepareBindings($bindings), $e
    821▕                 );
    822▕             }
    823▕ 
  ➜ 824▕             throw new QueryException(
    825▕                 $this->getName(), $query, $this->prepareBindings($bindings), $e
    826▕             );
    827▕         }
    828▕     }

      [2m+8 vendor frames [22m
  9   database/seeders/UserRolesSeeder.php:69
      [2m+23 vendor frames [22m
  33  tests/Feature/Dashboard/OrganizerStatsTest.php:22

  ────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\Dashboard\OrganizerStatsTest > pend…  QueryException   
  SQLSTATE[HY000]: General error: 1 no such table: user_roles (Connection: sqlite, SQL: insert into "user_roles" ("created_at", "description", "permissions", "role_code", "role_name", "updated_at") values (2025-10-29 13:25:54, Full access to platform configuration and all organizations, ["manage_platform","manage_organizations","manage_users","view_all_events"], platform_admin, Platform Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Administrator of a primary entity (government, municipality), ["manage_entity_events","approve_events","manage_entity_users","view_analytics"], entity_admin, Entity Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Staff member of a primary entity with limited permissions, ["create_events","edit_own_events","view_entity_events"], entity_staff, Entity Staff, 2025-10-29 13:25:54), (2025-10-29 13:25:54, External organizer who can create and manage their own events, ["create_events","manage_own_events","view_own_analytics"], organizer_admin, Event Organizer, 2025-10-29 13:25:54))

  at vendor/laravel/framework/src/Illuminate/Database/Connection.php:824
    820▕                     $this->getName(), $query, $this->prepareBindings($bindings), $e
    821▕                 );
    822▕             }
    823▕ 
  ➜ 824▕             throw new QueryException(
    825▕                 $this->getName(), $query, $this->prepareBindings($bindings), $e
    826▕             );
    827▕         }
    828▕     }

      [2m+8 vendor frames [22m
  9   database/seeders/UserRolesSeeder.php:69
      [2m+23 vendor frames [22m
  33  tests/Feature/Dashboard/OrganizerStatsTest.php:22

  ────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\Dashboard\OrganizerStatsTest > appr…  QueryException   
  SQLSTATE[HY000]: General error: 1 no such table: user_roles (Connection: sqlite, SQL: insert into "user_roles" ("created_at", "description", "permissions", "role_code", "role_name", "updated_at") values (2025-10-29 13:25:54, Full access to platform configuration and all organizations, ["manage_platform","manage_organizations","manage_users","view_all_events"], platform_admin, Platform Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Administrator of a primary entity (government, municipality), ["manage_entity_events","approve_events","manage_entity_users","view_analytics"], entity_admin, Entity Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Staff member of a primary entity with limited permissions, ["create_events","edit_own_events","view_entity_events"], entity_staff, Entity Staff, 2025-10-29 13:25:54), (2025-10-29 13:25:54, External organizer who can create and manage their own events, ["create_events","manage_own_events","view_own_analytics"], organizer_admin, Event Organizer, 2025-10-29 13:25:54))

  at vendor/laravel/framework/src/Illuminate/Database/Connection.php:824
    820▕                     $this->getName(), $query, $this->prepareBindings($bindings), $e
    821▕                 );
    822▕             }
    823▕ 
  ➜ 824▕             throw new QueryException(
    825▕                 $this->getName(), $query, $this->prepareBindings($bindings), $e
    826▕             );
    827▕         }
    828▕     }

      [2m+8 vendor frames [22m
  9   database/seeders/UserRolesSeeder.php:69
      [2m+23 vendor frames [22m
  33  tests/Feature/Dashboard/OrganizerStatsTest.php:22

  ────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\Dashboard\OrganizerStatsTest > pend…  QueryException   
  SQLSTATE[HY000]: General error: 1 no such table: user_roles (Connection: sqlite, SQL: insert into "user_roles" ("created_at", "description", "permissions", "role_code", "role_name", "updated_at") values (2025-10-29 13:25:54, Full access to platform configuration and all organizations, ["manage_platform","manage_organizations","manage_users","view_all_events"], platform_admin, Platform Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Administrator of a primary entity (government, municipality), ["manage_entity_events","approve_events","manage_entity_users","view_analytics"], entity_admin, Entity Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Staff member of a primary entity with limited permissions, ["create_events","edit_own_events","view_entity_events"], entity_staff, Entity Staff, 2025-10-29 13:25:54), (2025-10-29 13:25:54, External organizer who can create and manage their own events, ["create_events","manage_own_events","view_own_analytics"], organizer_admin, Event Organizer, 2025-10-29 13:25:54))

  at vendor/laravel/framework/src/Illuminate/Database/Connection.php:824
    820▕                     $this->getName(), $query, $this->prepareBindings($bindings), $e
    821▕                 );
    822▕             }
    823▕ 
  ➜ 824▕             throw new QueryException(
    825▕                 $this->getName(), $query, $this->prepareBindings($bindings), $e
    826▕             );
    827▕         }
    828▕     }

      [2m+8 vendor frames [22m
  9   database/seeders/UserRolesSeeder.php:69
      [2m+23 vendor frames [22m
  33  tests/Feature/Dashboard/OrganizerStatsTest.php:22

  ────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\Dashboard\OrganizerStatsTest > publ…  QueryException   
  SQLSTATE[HY000]: General error: 1 no such table: user_roles (Connection: sqlite, SQL: insert into "user_roles" ("created_at", "description", "permissions", "role_code", "role_name", "updated_at") values (2025-10-29 13:25:54, Full access to platform configuration and all organizations, ["manage_platform","manage_organizations","manage_users","view_all_events"], platform_admin, Platform Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Administrator of a primary entity (government, municipality), ["manage_entity_events","approve_events","manage_entity_users","view_analytics"], entity_admin, Entity Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Staff member of a primary entity with limited permissions, ["create_events","edit_own_events","view_entity_events"], entity_staff, Entity Staff, 2025-10-29 13:25:54), (2025-10-29 13:25:54, External organizer who can create and manage their own events, ["create_events","manage_own_events","view_own_analytics"], organizer_admin, Event Organizer, 2025-10-29 13:25:54))

  at vendor/laravel/framework/src/Illuminate/Database/Connection.php:824
    820▕                     $this->getName(), $query, $this->prepareBindings($bindings), $e
    821▕                 );
    822▕             }
    823▕ 
  ➜ 824▕             throw new QueryException(
    825▕                 $this->getName(), $query, $this->prepareBindings($bindings), $e
    826▕             );
    827▕         }
    828▕     }

      [2m+8 vendor frames [22m
  9   database/seeders/UserRolesSeeder.php:69
      [2m+23 vendor frames [22m
  33  tests/Feature/Dashboard/OrganizerStatsTest.php:22

  ────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\Dashboard\OrganizerStatsTest > requ…  QueryException   
  SQLSTATE[HY000]: General error: 1 no such table: user_roles (Connection: sqlite, SQL: insert into "user_roles" ("created_at", "description", "permissions", "role_code", "role_name", "updated_at") values (2025-10-29 13:25:54, Full access to platform configuration and all organizations, ["manage_platform","manage_organizations","manage_users","view_all_events"], platform_admin, Platform Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Administrator of a primary entity (government, municipality), ["manage_entity_events","approve_events","manage_entity_users","view_analytics"], entity_admin, Entity Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Staff member of a primary entity with limited permissions, ["create_events","edit_own_events","view_entity_events"], entity_staff, Entity Staff, 2025-10-29 13:25:54), (2025-10-29 13:25:54, External organizer who can create and manage their own events, ["create_events","manage_own_events","view_own_analytics"], organizer_admin, Event Organizer, 2025-10-29 13:25:54))

  at vendor/laravel/framework/src/Illuminate/Database/Connection.php:824
    820▕                     $this->getName(), $query, $this->prepareBindings($bindings), $e
    821▕                 );
    822▕             }
    823▕ 
  ➜ 824▕             throw new QueryException(
    825▕                 $this->getName(), $query, $this->prepareBindings($bindings), $e
    826▕             );
    827▕         }
    828▕     }

      [2m+8 vendor frames [22m
  9   database/seeders/UserRolesSeeder.php:69
      [2m+23 vendor frames [22m
  33  tests/Feature/Dashboard/OrganizerStatsTest.php:22

  ────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\Dashboard\OrganizerStatsTest > reje…  QueryException   
  SQLSTATE[HY000]: General error: 1 no such table: user_roles (Connection: sqlite, SQL: insert into "user_roles" ("created_at", "description", "permissions", "role_code", "role_name", "updated_at") values (2025-10-29 13:25:54, Full access to platform configuration and all organizations, ["manage_platform","manage_organizations","manage_users","view_all_events"], platform_admin, Platform Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Administrator of a primary entity (government, municipality), ["manage_entity_events","approve_events","manage_entity_users","view_analytics"], entity_admin, Entity Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Staff member of a primary entity with limited permissions, ["create_events","edit_own_events","view_entity_events"], entity_staff, Entity Staff, 2025-10-29 13:25:54), (2025-10-29 13:25:54, External organizer who can create and manage their own events, ["create_events","manage_own_events","view_own_analytics"], organizer_admin, Event Organizer, 2025-10-29 13:25:54))

  at vendor/laravel/framework/src/Illuminate/Database/Connection.php:824
    820▕                     $this->getName(), $query, $this->prepareBindings($bindings), $e
    821▕                 );
    822▕             }
    823▕ 
  ➜ 824▕             throw new QueryException(
    825▕                 $this->getName(), $query, $this->prepareBindings($bindings), $e
    826▕             );
    827▕         }
    828▕     }

      [2m+8 vendor frames [22m
  9   database/seeders/UserRolesSeeder.php:69
      [2m+23 vendor frames [22m
  33  tests/Feature/Dashboard/OrganizerStatsTest.php:22

  ────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\EventTest > can list events           QueryException   
  SQLSTATE[HY000]: General error: 1 no such table: user_roles (Connection: sqlite, SQL: insert into "user_roles" ("created_at", "description", "permissions", "role_code", "role_name", "updated_at") values (2025-10-29 13:25:54, Full access to platform configuration and all organizations, ["manage_platform","manage_organizations","manage_users","view_all_events"], platform_admin, Platform Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Administrator of a primary entity (government, municipality), ["manage_entity_events","approve_events","manage_entity_users","view_analytics"], entity_admin, Entity Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Staff member of a primary entity with limited permissions, ["create_events","edit_own_events","view_entity_events"], entity_staff, Entity Staff, 2025-10-29 13:25:54), (2025-10-29 13:25:54, External organizer who can create and manage their own events, ["create_events","manage_own_events","view_own_analytics"], organizer_admin, Event Organizer, 2025-10-29 13:25:54))

  at vendor/laravel/framework/src/Illuminate/Database/Connection.php:824
    820▕                     $this->getName(), $query, $this->prepareBindings($bindings), $e
    821▕                 );
    822▕             }
    823▕ 
  ➜ 824▕             throw new QueryException(
    825▕                 $this->getName(), $query, $this->prepareBindings($bindings), $e
    826▕             );
    827▕         }
    828▕     }

      [2m+8 vendor frames [22m
  9   database/seeders/UserRolesSeeder.php:69
      [2m+23 vendor frames [22m
  33  tests/Feature/EventTest.php:22

  ────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\EventTest > can create event          QueryException   
  SQLSTATE[HY000]: General error: 1 no such table: user_roles (Connection: sqlite, SQL: insert into "user_roles" ("created_at", "description", "permissions", "role_code", "role_name", "updated_at") values (2025-10-29 13:25:54, Full access to platform configuration and all organizations, ["manage_platform","manage_organizations","manage_users","view_all_events"], platform_admin, Platform Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Administrator of a primary entity (government, municipality), ["manage_entity_events","approve_events","manage_entity_users","view_analytics"], entity_admin, Entity Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Staff member of a primary entity with limited permissions, ["create_events","edit_own_events","view_entity_events"], entity_staff, Entity Staff, 2025-10-29 13:25:54), (2025-10-29 13:25:54, External organizer who can create and manage their own events, ["create_events","manage_own_events","view_own_analytics"], organizer_admin, Event Organizer, 2025-10-29 13:25:54))

  at vendor/laravel/framework/src/Illuminate/Database/Connection.php:824
    820▕                     $this->getName(), $query, $this->prepareBindings($bindings), $e
    821▕                 );
    822▕             }
    823▕ 
  ➜ 824▕             throw new QueryException(
    825▕                 $this->getName(), $query, $this->prepareBindings($bindings), $e
    826▕             );
    827▕         }
    828▕     }

      [2m+8 vendor frames [22m
  9   database/seeders/UserRolesSeeder.php:69
      [2m+23 vendor frames [22m
  33  tests/Feature/EventTest.php:22

  ────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\EventTest > can update event          QueryException   
  SQLSTATE[HY000]: General error: 1 no such table: user_roles (Connection: sqlite, SQL: insert into "user_roles" ("created_at", "description", "permissions", "role_code", "role_name", "updated_at") values (2025-10-29 13:25:54, Full access to platform configuration and all organizations, ["manage_platform","manage_organizations","manage_users","view_all_events"], platform_admin, Platform Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Administrator of a primary entity (government, municipality), ["manage_entity_events","approve_events","manage_entity_users","view_analytics"], entity_admin, Entity Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Staff member of a primary entity with limited permissions, ["create_events","edit_own_events","view_entity_events"], entity_staff, Entity Staff, 2025-10-29 13:25:54), (2025-10-29 13:25:54, External organizer who can create and manage their own events, ["create_events","manage_own_events","view_own_analytics"], organizer_admin, Event Organizer, 2025-10-29 13:25:54))

  at vendor/laravel/framework/src/Illuminate/Database/Connection.php:824
    820▕                     $this->getName(), $query, $this->prepareBindings($bindings), $e
    821▕                 );
    822▕             }
    823▕ 
  ➜ 824▕             throw new QueryException(
    825▕                 $this->getName(), $query, $this->prepareBindings($bindings), $e
    826▕             );
    827▕         }
    828▕     }

      [2m+8 vendor frames [22m
  9   database/seeders/UserRolesSeeder.php:69
      [2m+23 vendor frames [22m
  33  tests/Feature/EventTest.php:22

  ────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\EventTest > can delete event          QueryException   
  SQLSTATE[HY000]: General error: 1 no such table: user_roles (Connection: sqlite, SQL: insert into "user_roles" ("created_at", "description", "permissions", "role_code", "role_name", "updated_at") values (2025-10-29 13:25:54, Full access to platform configuration and all organizations, ["manage_platform","manage_organizations","manage_users","view_all_events"], platform_admin, Platform Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Administrator of a primary entity (government, municipality), ["manage_entity_events","approve_events","manage_entity_users","view_analytics"], entity_admin, Entity Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Staff member of a primary entity with limited permissions, ["create_events","edit_own_events","view_entity_events"], entity_staff, Entity Staff, 2025-10-29 13:25:54), (2025-10-29 13:25:54, External organizer who can create and manage their own events, ["create_events","manage_own_events","view_own_analytics"], organizer_admin, Event Organizer, 2025-10-29 13:25:54))

  at vendor/laravel/framework/src/Illuminate/Database/Connection.php:824
    820▕                     $this->getName(), $query, $this->prepareBindings($bindings), $e
    821▕                 );
    822▕             }
    823▕ 
  ➜ 824▕             throw new QueryException(
    825▕                 $this->getName(), $query, $this->prepareBindings($bindings), $e
    826▕             );
    827▕         }
    828▕     }

      [2m+8 vendor frames [22m
  9   database/seeders/UserRolesSeeder.php:69
      [2m+23 vendor frames [22m
  33  tests/Feature/EventTest.php:22

  ────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\EventTest > can get event statistic…  QueryException   
  SQLSTATE[HY000]: General error: 1 no such table: user_roles (Connection: sqlite, SQL: insert into "user_roles" ("created_at", "description", "permissions", "role_code", "role_name", "updated_at") values (2025-10-29 13:25:54, Full access to platform configuration and all organizations, ["manage_platform","manage_organizations","manage_users","view_all_events"], platform_admin, Platform Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Administrator of a primary entity (government, municipality), ["manage_entity_events","approve_events","manage_entity_users","view_analytics"], entity_admin, Entity Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Staff member of a primary entity with limited permissions, ["create_events","edit_own_events","view_entity_events"], entity_staff, Entity Staff, 2025-10-29 13:25:54), (2025-10-29 13:25:54, External organizer who can create and manage their own events, ["create_events","manage_own_events","view_own_analytics"], organizer_admin, Event Organizer, 2025-10-29 13:25:54))

  at vendor/laravel/framework/src/Illuminate/Database/Connection.php:824
    820▕                     $this->getName(), $query, $this->prepareBindings($bindings), $e
    821▕                 );
    822▕             }
    823▕ 
  ➜ 824▕             throw new QueryException(
    825▕                 $this->getName(), $query, $this->prepareBindings($bindings), $e
    826▕             );
    827▕         }
    828▕     }

      [2m+8 vendor frames [22m
  9   database/seeders/UserRolesSeeder.php:69
      [2m+23 vendor frames [22m
  33  tests/Feature/EventTest.php:22

  ────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\EventTest > can duplicate event       QueryException   
  SQLSTATE[HY000]: General error: 1 no such table: user_roles (Connection: sqlite, SQL: insert into "user_roles" ("created_at", "description", "permissions", "role_code", "role_name", "updated_at") values (2025-10-29 13:25:54, Full access to platform configuration and all organizations, ["manage_platform","manage_organizations","manage_users","view_all_events"], platform_admin, Platform Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Administrator of a primary entity (government, municipality), ["manage_entity_events","approve_events","manage_entity_users","view_analytics"], entity_admin, Entity Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Staff member of a primary entity with limited permissions, ["create_events","edit_own_events","view_entity_events"], entity_staff, Entity Staff, 2025-10-29 13:25:54), (2025-10-29 13:25:54, External organizer who can create and manage their own events, ["create_events","manage_own_events","view_own_analytics"], organizer_admin, Event Organizer, 2025-10-29 13:25:54))

  at vendor/laravel/framework/src/Illuminate/Database/Connection.php:824
    820▕                     $this->getName(), $query, $this->prepareBindings($bindings), $e
    821▕                 );
    822▕             }
    823▕ 
  ➜ 824▕             throw new QueryException(
    825▕                 $this->getName(), $query, $this->prepareBindings($bindings), $e
    826▕             );
    827▕         }
    828▕     }

      [2m+8 vendor frames [22m
  9   database/seeders/UserRolesSeeder.php:69
      [2m+23 vendor frames [22m
  33  tests/Feature/EventTest.php:22

  ────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\EventTest > can toggle featured sta…  QueryException   
  SQLSTATE[HY000]: General error: 1 no such table: user_roles (Connection: sqlite, SQL: insert into "user_roles" ("created_at", "description", "permissions", "role_code", "role_name", "updated_at") values (2025-10-29 13:25:54, Full access to platform configuration and all organizations, ["manage_platform","manage_organizations","manage_users","view_all_events"], platform_admin, Platform Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Administrator of a primary entity (government, municipality), ["manage_entity_events","approve_events","manage_entity_users","view_analytics"], entity_admin, Entity Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Staff member of a primary entity with limited permissions, ["create_events","edit_own_events","view_entity_events"], entity_staff, Entity Staff, 2025-10-29 13:25:54), (2025-10-29 13:25:54, External organizer who can create and manage their own events, ["create_events","manage_own_events","view_own_analytics"], organizer_admin, Event Organizer, 2025-10-29 13:25:54))

  at vendor/laravel/framework/src/Illuminate/Database/Connection.php:824
    820▕                     $this->getName(), $query, $this->prepareBindings($bindings), $e
    821▕                 );
    822▕             }
    823▕ 
  ➜ 824▕             throw new QueryException(
    825▕                 $this->getName(), $query, $this->prepareBindings($bindings), $e
    826▕             );
    827▕         }
    828▕     }

      [2m+8 vendor frames [22m
  9   database/seeders/UserRolesSeeder.php:69
      [2m+23 vendor frames [22m
  33  tests/Feature/EventTest.php:22

  ────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\EventTest > can get single event de…  QueryException   
  SQLSTATE[HY000]: General error: 1 no such table: user_roles (Connection: sqlite, SQL: insert into "user_roles" ("created_at", "description", "permissions", "role_code", "role_name", "updated_at") values (2025-10-29 13:25:54, Full access to platform configuration and all organizations, ["manage_platform","manage_organizations","manage_users","view_all_events"], platform_admin, Platform Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Administrator of a primary entity (government, municipality), ["manage_entity_events","approve_events","manage_entity_users","view_analytics"], entity_admin, Entity Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Staff member of a primary entity with limited permissions, ["create_events","edit_own_events","view_entity_events"], entity_staff, Entity Staff, 2025-10-29 13:25:54), (2025-10-29 13:25:54, External organizer who can create and manage their own events, ["create_events","manage_own_events","view_own_analytics"], organizer_admin, Event Organizer, 2025-10-29 13:25:54))

  at vendor/laravel/framework/src/Illuminate/Database/Connection.php:824
    820▕                     $this->getName(), $query, $this->prepareBindings($bindings), $e
    821▕                 );
    822▕             }
    823▕ 
  ➜ 824▕             throw new QueryException(
    825▕                 $this->getName(), $query, $this->prepareBindings($bindings), $e
    826▕             );
    827▕         }
    828▕     }

      [2m+8 vendor frames [22m
  9   database/seeders/UserRolesSeeder.php:69
      [2m+23 vendor frames [22m
  33  tests/Feature/EventTest.php:22

  ────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\LocationTest > can list locations     QueryException   
  SQLSTATE[HY000]: General error: 1 no such table: user_roles (Connection: sqlite, SQL: insert into "user_roles" ("created_at", "description", "permissions", "role_code", "role_name", "updated_at") values (2025-10-29 13:25:54, Full access to platform configuration and all organizations, ["manage_platform","manage_organizations","manage_users","view_all_events"], platform_admin, Platform Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Administrator of a primary entity (government, municipality), ["manage_entity_events","approve_events","manage_entity_users","view_analytics"], entity_admin, Entity Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Staff member of a primary entity with limited permissions, ["create_events","edit_own_events","view_entity_events"], entity_staff, Entity Staff, 2025-10-29 13:25:54), (2025-10-29 13:25:54, External organizer who can create and manage their own events, ["create_events","manage_own_events","view_own_analytics"], organizer_admin, Event Organizer, 2025-10-29 13:25:54))

  at vendor/laravel/framework/src/Illuminate/Database/Connection.php:824
    820▕                     $this->getName(), $query, $this->prepareBindings($bindings), $e
    821▕                 );
    822▕             }
    823▕ 
  ➜ 824▕             throw new QueryException(
    825▕                 $this->getName(), $query, $this->prepareBindings($bindings), $e
    826▕             );
    827▕         }
    828▕     }

      [2m+8 vendor frames [22m
  9   database/seeders/UserRolesSeeder.php:69
      [2m+23 vendor frames [22m
  33  tests/Feature/LocationTest.php:22

  ────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\LocationTest > can create location    QueryException   
  SQLSTATE[HY000]: General error: 1 no such table: user_roles (Connection: sqlite, SQL: insert into "user_roles" ("created_at", "description", "permissions", "role_code", "role_name", "updated_at") values (2025-10-29 13:25:54, Full access to platform configuration and all organizations, ["manage_platform","manage_organizations","manage_users","view_all_events"], platform_admin, Platform Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Administrator of a primary entity (government, municipality), ["manage_entity_events","approve_events","manage_entity_users","view_analytics"], entity_admin, Entity Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Staff member of a primary entity with limited permissions, ["create_events","edit_own_events","view_entity_events"], entity_staff, Entity Staff, 2025-10-29 13:25:54), (2025-10-29 13:25:54, External organizer who can create and manage their own events, ["create_events","manage_own_events","view_own_analytics"], organizer_admin, Event Organizer, 2025-10-29 13:25:54))

  at vendor/laravel/framework/src/Illuminate/Database/Connection.php:824
    820▕                     $this->getName(), $query, $this->prepareBindings($bindings), $e
    821▕                 );
    822▕             }
    823▕ 
  ➜ 824▕             throw new QueryException(
    825▕                 $this->getName(), $query, $this->prepareBindings($bindings), $e
    826▕             );
    827▕         }
    828▕     }

      [2m+8 vendor frames [22m
  9   database/seeders/UserRolesSeeder.php:69
      [2m+23 vendor frames [22m
  33  tests/Feature/LocationTest.php:22

  ────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\LocationTest > can update location    QueryException   
  SQLSTATE[HY000]: General error: 1 no such table: user_roles (Connection: sqlite, SQL: insert into "user_roles" ("created_at", "description", "permissions", "role_code", "role_name", "updated_at") values (2025-10-29 13:25:54, Full access to platform configuration and all organizations, ["manage_platform","manage_organizations","manage_users","view_all_events"], platform_admin, Platform Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Administrator of a primary entity (government, municipality), ["manage_entity_events","approve_events","manage_entity_users","view_analytics"], entity_admin, Entity Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Staff member of a primary entity with limited permissions, ["create_events","edit_own_events","view_entity_events"], entity_staff, Entity Staff, 2025-10-29 13:25:54), (2025-10-29 13:25:54, External organizer who can create and manage their own events, ["create_events","manage_own_events","view_own_analytics"], organizer_admin, Event Organizer, 2025-10-29 13:25:54))

  at vendor/laravel/framework/src/Illuminate/Database/Connection.php:824
    820▕                     $this->getName(), $query, $this->prepareBindings($bindings), $e
    821▕                 );
    822▕             }
    823▕ 
  ➜ 824▕             throw new QueryException(
    825▕                 $this->getName(), $query, $this->prepareBindings($bindings), $e
    826▕             );
    827▕         }
    828▕     }

      [2m+8 vendor frames [22m
  9   database/seeders/UserRolesSeeder.php:69
      [2m+23 vendor frames [22m
  33  tests/Feature/LocationTest.php:22

  ────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\LocationTest > can delete location    QueryException   
  SQLSTATE[HY000]: General error: 1 no such table: user_roles (Connection: sqlite, SQL: insert into "user_roles" ("created_at", "description", "permissions", "role_code", "role_name", "updated_at") values (2025-10-29 13:25:54, Full access to platform configuration and all organizations, ["manage_platform","manage_organizations","manage_users","view_all_events"], platform_admin, Platform Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Administrator of a primary entity (government, municipality), ["manage_entity_events","approve_events","manage_entity_users","view_analytics"], entity_admin, Entity Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Staff member of a primary entity with limited permissions, ["create_events","edit_own_events","view_entity_events"], entity_staff, Entity Staff, 2025-10-29 13:25:54), (2025-10-29 13:25:54, External organizer who can create and manage their own events, ["create_events","manage_own_events","view_own_analytics"], organizer_admin, Event Organizer, 2025-10-29 13:25:54))

  at vendor/laravel/framework/src/Illuminate/Database/Connection.php:824
    820▕                     $this->getName(), $query, $this->prepareBindings($bindings), $e
    821▕                 );
    822▕             }
    823▕ 
  ➜ 824▕             throw new QueryException(
    825▕                 $this->getName(), $query, $this->prepareBindings($bindings), $e
    826▕             );
    827▕         }
    828▕     }

      [2m+8 vendor frames [22m
  9   database/seeders/UserRolesSeeder.php:69
      [2m+23 vendor frames [22m
  33  tests/Feature/LocationTest.php:22

  ────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\LocationTest > can get active locat…  QueryException   
  SQLSTATE[HY000]: General error: 1 no such table: user_roles (Connection: sqlite, SQL: insert into "user_roles" ("created_at", "description", "permissions", "role_code", "role_name", "updated_at") values (2025-10-29 13:25:54, Full access to platform configuration and all organizations, ["manage_platform","manage_organizations","manage_users","view_all_events"], platform_admin, Platform Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Administrator of a primary entity (government, municipality), ["manage_entity_events","approve_events","manage_entity_users","view_analytics"], entity_admin, Entity Administrator, 2025-10-29 13:25:54), (2025-10-29 13:25:54, Staff member of a primary entity with limited permissions, ["create_events","edit_own_events","view_entity_events"], entity_staff, Entity Staff, 2025-10-29 13:25:54), (2025-10-29 13:25:54, External organizer who can create and manage their own events, ["create_events","manage_own_events","view_own_analytics"], organizer_admin, Event Organizer, 2025-10-29 13:25:54))

  at vendor/laravel/framework/src/Illuminate/Database/Connection.php:824
    820▕                     $this->getName(), $query, $this->prepareBindings($bindings), $e
    821▕                 );
    822▕             }
    823▕ 
  ➜ 824▕             throw new QueryException(
    825▕                 $this->getName(), $query, $this->prepareBindings($bindings), $e
    826▕             );
    827▕         }
    828▕     }

      [2m+8 vendor frames [22m
  9   database/seeders/UserRolesSeeder.php:69
      [2m+23 vendor frames [22m
  33  tests/Feature/LocationTest.php:22


  Tests:    33 failed, 3 passed (4 assertions)
  Duration: 0.28s

```

## 📏 CODE METRICS

**Features LOC:** 3779 lines
**Total PHP LOC:** 6230 lines

**TODOs in code:**        1
**FIXMEs in code:**        0

## 📦 OUTDATED DEPENDENCIES

```
laravel/framework 12.24.0 ! 12.36.0 The Laravel Framework.
laravel/pint      1.24.0  ! 1.25.1  An opinionated code formatter for PHP.
laravel/sail      1.44.0  ! 1.47.0  Docker files for running a basic Laravel...
phpunit/phpunit   11.5.32 ~ 12.4.1  The PHP Unit Testing framework.
```

