# DATABASE_SCHEMA.md

## Overview
This schema represents a relational data model centered on **profiles**, **scenarios**, **approaches**, and **products**.  
It appears to model developer and partner workflows, capabilities, and study scenarios — possibly for UX or AI-assisted coding experiments.

All tables use **InnoDB** and **binary(16)** UUID primary keys generated via `uuid_to_bin(uuid(), true)`.

---

## Tables

### dataset_snapshots  (~0 rows)
**Purpose:** Stores versioned JSON dataset snapshots for reproducibility and analysis.

| Column | Type | Null | Default | Extra |
|--------|------|-------|----------|--------|
| id | binary(16) | NO | uuid_to_bin(uuid(), true) | DEFAULT_GENERATED |
| source_version | varchar(16) | NO | — |  |
| source_timestamp | datetime(3) | NO | — |  |
| raw_json | json | YES | — |  |
| created_at | timestamp(3) | NO | CURRENT_TIMESTAMP(3) | DEFAULT_GENERATED |

**Primary Key:** `id`  
**Foreign Keys:** *(none)*  
**Indexes:** *(none)*  

---

### dev_approaches  (~5 rows)
**Purpose:** Defines internal development approaches (e.g., agile, waterfall, AI-assisted coding styles).

| Column | Type | Null | Default | Extra |
|--------|------|-------|----------|--------|
| id | binary(16) | NO | uuid_to_bin(uuid(), true) | DEFAULT_GENERATED |
| slug | varchar(64) | NO | — |  |
| name | varchar(64) | NO | — |  |
| description | varchar(255) | YES | — |  |
| sort_order | int | NO | 0 |  |
| is_active | tinyint(1) | NO | 1 |  |
| created_at | timestamp(3) | NO | CURRENT_TIMESTAMP(3) | DEFAULT_GENERATED |
| updated_at | timestamp(3) | NO | CURRENT_TIMESTAMP(3) | DEFAULT_GENERATED on update CURRENT_TIMESTAMP(3) |

**Primary Key:** `id`  
**Unique Constraints:**  
- `uq_dev_approach_slug` (`slug`)  
- `uq_dev_approach_name` (`name`)  

**Foreign Keys:** *(none)*  

---

### partner_approaches  (~3 rows)
**Purpose:** Defines partner or external collaboration approaches (e.g., consultancy, academic, or vendor strategies).

| Column | Type | Null | Default | Extra |
|--------|------|-------|----------|--------|
| id | binary(16) | NO | uuid_to_bin(uuid(), true) | DEFAULT_GENERATED |
| slug | varchar(64) | NO | — |  |
| name | varchar(64) | NO | — |  |
| description | varchar(255) | YES | — |  |
| sort_order | int | NO | 0 |  |
| is_active | tinyint(1) | NO | 1 |  |
| created_at | timestamp(3) | NO | CURRENT_TIMESTAMP(3) | DEFAULT_GENERATED |
| updated_at | timestamp(3) | NO | CURRENT_TIMESTAMP(3) | DEFAULT_GENERATED on update CURRENT_TIMESTAMP(3) |

**Primary Key:** `id`  
**Unique Constraints:**  
- `uq_partner_approach_slug` (`slug`)  
- `uq_partner_approach_name` (`name`)  

---

### products  (~5 rows)
**Purpose:** Represents available products being studied or configured (e.g., AI assistants, IDEs, or tools).

| Column | Type | Null | Default | Extra |
|--------|------|-------|----------|--------|
| id | binary(16) | NO | uuid_to_bin(uuid(), true) | DEFAULT_GENERATED |
| product_key | varchar(64) | NO | — |  |
| display_name | varchar(128) | YES | — |  |

**Primary Key:** `id`  
**Unique Constraints:**  
- `uq_products_key` (`product_key`)  

---

### product_capabilities  (~0 rows)
**Purpose:** Maps products to development and partner approaches — a many-to-many join table with position ordering.

| Column | Type | Null | Default | Extra |
|--------|------|-------|----------|--------|
| id | binary(16) | NO | uuid_to_bin(uuid(), true) | DEFAULT_GENERATED |
| product_id | binary(16) | NO | — |  |
| dev_approach_id | binary(16) | NO | — |  |
| partner_approach_id | binary(16) | NO | — |  |
| position | int | NO | — |  |
| created_at | timestamp(3) | NO | CURRENT_TIMESTAMP(3) | DEFAULT_GENERATED |
| updated_at | timestamp(3) | NO | CURRENT_TIMESTAMP(3) | DEFAULT_GENERATED on update CURRENT_TIMESTAMP(3) |

**Primary Key:** `id`  
**Foreign Keys:**  
- `fk_pc_product`: `product_capabilities.product_id → products.id`  
- `fk_pc_dev`: `product_capabilities.dev_approach_id → dev_approaches.id`  
- `fk_pc_partner`: `product_capabilities.partner_approach_id → partner_approaches.id`  

**Unique Constraints:**  
- `uq_pc_product_pos` (`product_id`, `position`)  
- `uq_pc_combo` (`product_id`, `dev_approach_id`, `partner_approach_id`)  

**Indexes:**  
- `idx_pc_lookup` (`product_id`, `dev_approach_id`, `partner_approach_id`)  

---

### profiles  (~3 rows)
**Purpose:** Represents personas or developer profiles for study contexts.

| Column | Type | Null | Default | Extra |
|--------|------|-------|----------|--------|
| id | binary(16) | NO | uuid_to_bin(uuid(), true) | DEFAULT_GENERATED |
| profile_key | varchar(64) | NO | — |  |
| display_name | varchar(128) | YES | — |  |
| expertise | tinyint unsigned | YES | — |  |
| aicapability | tinyint unsigned | YES | — |  |
| governance | tinyint unsigned | YES | — |  |
| created_at | timestamp(3) | NO | CURRENT_TIMESTAMP(3) | DEFAULT_GENERATED |
| updated_at | timestamp(3) | NO | CURRENT_TIMESTAMP(3) | DEFAULT_GENERATED on update CURRENT_TIMESTAMP(3) |

**Primary Key:** `id`  
**Unique Constraints:**  
- `uq_profiles_key` (`profile_key`)  

---

### scenarios  (~4 rows)
**Purpose:** Defines contextual tasks or experimental setups linked to profiles.

| Column | Type | Null | Default | Extra |
|--------|------|-------|----------|--------|
| id | binary(16) | NO | uuid_to_bin(uuid(), true) | DEFAULT_GENERATED |
| profile_id | binary(16) | NO | — |  |
| scenario_key | varchar(64) | NO | — |  |
| display_name | varchar(128) | YES | — |  |
| importance | tinyint unsigned | YES | — |  |
| complexity | tinyint unsigned | YES | — |  |
| maturity | tinyint unsigned | YES | — |  |
| created_at | timestamp(3) | NO | CURRENT_TIMESTAMP(3) | DEFAULT_GENERATED |
| updated_at | timestamp(3) | NO | CURRENT_TIMESTAMP(3) | DEFAULT_GENERATED on update CURRENT_TIMESTAMP(3) |

**Primary Key:** `id`  
**Foreign Keys:**  
- `fk_scenarios_profile`: `scenarios.profile_id → profiles.id`  

**Unique Constraints:**  
- `uq_scenarios` (`profile_id`, `scenario_key`)  

---

### workflow_steps  (~0 rows)
**Purpose:** Represents ordered workflow steps within scenarios — each step linking to developer and partner approaches.

| Column | Type | Null | Default | Extra |
|--------|------|-------|----------|--------|
| id | binary(16) | NO | uuid_to_bin(uuid(), true) | DEFAULT_GENERATED |
| scenario_id | binary(16) | NO | — |  |
| step_index | int | NO | — |  |
| dev_approach_id | binary(16) | NO | — |  |
| partner_approach_id | binary(16) | NO | — |  |
| created_at | timestamp(3) | NO | CURRENT_TIMESTAMP(3) | DEFAULT_GENERATED |
| updated_at | timestamp(3) | NO | CURRENT_TIMESTAMP(3) | DEFAULT_GENERATED on update CURRENT_TIMESTAMP(3) |

**Primary Key:** `id`  
**Foreign Keys:**  
- `fk_ws_scenario`: `workflow_steps.scenario_id → scenarios.id`  
- `fk_ws_dev`: `workflow_steps.dev_approach_id → dev_approaches.id`  
- `fk_ws_partner`: `workflow_steps.partner_approach_id → partner_approaches.id`  

---

## Relationships Map

- `products (1) —— (∞) product_capabilities`
- `dev_approaches (1) —— (∞) product_capabilities`
- `partner_approaches (1) —— (∞) product_capabilities`
- `profiles (1) —— (∞) scenarios`
- `scenarios (1) —— (∞) workflow_steps`
- `dev_approaches (1) —— (∞) workflow_steps`
- `partner_approaches (1) —— (∞) workflow_steps`

---

## Design Notes
- **UUIDs as binary(16):** Efficient primary keys for distributed inserts.  
- **Audit timestamps:** Every table tracks `created_at` and `updated_at`.  
- **Declarative modeling:** Tables align with a clean many-to-one hierarchy (products → capabilities → approaches → workflows).  
- **Ideal for AI use:** This schema can model generative UX tasks, agent capabilities, or evaluation frameworks.