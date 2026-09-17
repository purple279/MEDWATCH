# MEDWATCH — Medicine Shortage Early-Warning & Redistribution System

> **AI-powered healthcare supply-chain intelligence for detecting medicine shortages, predicting stockouts, and enabling proactive redistribution.**

## 🔗 Prototype

**Live Prototype:** https://purple279.github.io/MEDWATCH/

---

## 📌 Overview

MEDWATCH is a healthcare supply-chain decision-support system designed to help hospitals and district-level healthcare teams identify emerging medicine shortages before they become critical.

Instead of waiting for a facility to completely run out of medicine, MEDWATCH analyzes:

- Current medicine stock
- Daily consumption
- Stock coverage
- Consumption trends
- Projected stockout dates
- Replenishment schedules
- Regional shortage patterns
- Available surplus at nearby facilities

The system then recommends redistribution of existing stock to facilities at risk.

---

# 🎯 Problem Statement

Medicine shortages can affect multiple healthcare facilities at the same time.

A single hospital approaching stockout may appear to be an individual inventory problem. However, when several facilities in the same region are simultaneously experiencing declining stock of the same medicine, it can indicate an emerging regional supply shortage.

Traditional inventory monitoring may identify shortages only after stock levels become critically low.

MEDWATCH focuses on **early detection and proactive intervention**.

The core question is:

> **Can we detect a regional medicine shortage early enough to redistribute available stock and prevent facilities from running out?**

---

# 💡 Our Approach

MEDWATCH converts inventory and consumption information into actionable supply-chain intelligence.

## 1. Monitor

MEDWATCH tracks medicine stock across healthcare facilities.

The system calculates:

**Days of Stock = Current Stock / Daily Consumption**

Stock status is classified as:

| Stock Coverage | Status |
|---|---|
| > 14 days | Healthy |
| 7–14 days | Warning |
| < 7 days | Critical |
| ≥ 18 days | Surplus Donor |

This provides an immediate view of which facilities require attention.

---

## 2. Detect

MEDWATCH looks beyond individual facilities.

It identifies situations where multiple facilities in the same district are experiencing depletion of the same medicine.

For example:

**District 4 — Insulin**

- St. Jude District Hospital — 5 days
- Riverbed Community Clinic — 6 days
- Apex Valley Health Center — 8 days

Multiple facilities showing declining coverage creates a regional shortage signal.

---

## 3. Predict

MEDWATCH uses consumption trends and current stock levels to estimate when a facility may reach stockout.

The system considers:

- Current inventory
- Daily consumption
- Consumption acceleration
- Projected stockout date
- Scheduled replenishment date
- Delivery lead time

This allows supply-chain teams to see whether a replenishment is expected to arrive before or after the projected stockout.

---

## 4. Redistribute

If one facility is approaching stockout while another facility has sufficient surplus, MEDWATCH identifies a potential redistribution opportunity.

Example:

**Donor**

Eastside Regional Medical Center

**Receiver**

St. Jude District Hospital

**Transfer**

150 units

The system calculates how much stock can be transferred while maintaining a safety buffer at the donor facility.

The redistribution view shows:

- Donor stock
- Receiver stock
- Daily consumption
- Current coverage
- Safe donor threshold
- Maximum transferable quantity
- Expected receiver coverage after transfer

---

## 5. Stress Test

MEDWATCH allows users to simulate supply-chain disruptions.

Users can change:

- Demand increase
- Delivery delay
- Supply shock

The system then compares:

**Before → After**

including:

- Daily consumption
- Stock coverage
- Projected stockout date
- Regional shortage risk

This helps users understand how quickly a shortage can develop under changing conditions.

---

# 📊 Main Features

## Medicine Supply Status

Provides a facility-level view of medicine availability.

Displays:

- Medicine
- Healthcare facility
- Current stock
- Days of coverage
- Risk status

---

## Supply Trends

Interactive visualization showing medicine consumption over time.

This helps identify:

- Increasing demand
- Decreasing demand
- Peak consumption
- Recent consumption patterns

---

## Medicine Consumption & Depletion

Combines historical stock levels with consumption trends.

The visualization shows:

- Historical inventory
- Daily burn rate
- Projected depletion
- Critical threshold
- Projected stockout date

---

## Regional Shortage Detection

Identifies concurrent depletion across facilities in the same district.

MEDWATCH can highlight a regional shortage pattern when multiple facilities experience declining stock of the same medicine.

Example:

**District 4 — Insulin**

Multiple facilities approaching stockout at the same time.

---

## Regional Shortage Risk Trend

Tracks the changing shortage-risk signal over time.

The visualization helps supply-chain teams understand whether regional conditions are:

- Improving
- Stable
- Worsening

---

## Healthcare Supply Network Map

The network map provides a geographic view of the healthcare supply system.

It displays:

- 4 districts
- 12 healthcare facilities
- Facility stock status
- Critical facilities
- Warning facilities
- Healthy facilities
- Surplus donor facilities
- Redistribution corridors

The map allows users to quickly identify **where** shortages are developing.

---

## Stockout vs Replenishment

MEDWATCH compares:

**Projected Stockout Date**

with

**Scheduled Replenishment Date**

If replenishment arrives after the projected stockout, the system highlights the potential supply gap.

This helps answer:

> **Will the next delivery arrive before the medicine runs out?**

---

## Recommended Redistribution

MEDWATCH identifies facilities that may be able to donate stock to facilities approaching stockout.

The recommendation considers:

- Donor stock coverage
- Receiver stock coverage
- Daily consumption
- Safety threshold
- Distance
- Transfer quantity

---

## Redistribution Impact

The system shows the effect of a proposed transfer.

Example:

| Facility | Before | After |
|---|---:|---:|
| St. Jude District Hospital | 5 days | 12.5 days |
| Eastside Regional Medical Center | 18 days | 15 days |

This makes the benefit of redistribution immediately visible.

---

# 🤖 AI Explanation

MEDWATCH includes an AI-assisted explanation layer.

The explanation is organized into four parts:

### What happened?

Explains the detected shortage condition.

### Why is it happening?

Explains contributing factors such as:

- High consumption
- Rapid depletion
- Delayed replenishment
- Concurrent facility shortages

### When does it become critical?

Explains the projected stockout timeline and urgency.

### What should be done?

Provides actionable redistribution steps based on available stock.

The system also includes a rule-based fallback so that the explanation workflow can continue if the AI service is unavailable.

---

# 📈 Reports

MEDWATCH provides analytical reports for supply-chain monitoring.

Reports include:

1. Stock Coverage by Facility
2. Medicine Consumption Trends vs Baseline
3. Regional Shortage Risk Trend
4. Stockout vs Delivery Gap Comparison
5. Redistribution Impact

Reports can be filtered by:

- District
- Medicine
- Timeframe

The system also supports CSV export and printable audit summaries.

---

# 🔄 Complete Workflow

MEDWATCH follows a simple supply-chain workflow:

**MONITOR**

↓  

Track medicine inventory and consumption.

↓

**DETECT**

Identify facilities and districts showing shortage patterns.

↓

**PREDICT**

Estimate stockout dates and replenishment gaps.

↓

**REDISTRIBUTE**

Identify available surplus and calculate a safe transfer.

↓

**PREVENT**

Reduce the probability of preventable stockouts through early intervention.

---

# 🏥 Example Scenario

Consider four healthcare facilities in District 4 monitoring Insulin.

| Facility | Stock Coverage | Status |
|---|---:|---|
| St. Jude District Hospital | 5 days | Critical |
| Riverbed Community Clinic | 6 days | Critical |
| Apex Valley Health Center | 8 days | Warning |
| Eastside Regional Medical Center | 20 days | Surplus |

MEDWATCH detects that several facilities are simultaneously approaching low stock.

Instead of waiting for the facilities to run out, the system identifies Eastside Regional Medical Center as a potential donor.

A recommended transfer of **150 units** can increase the receiver's stock coverage while maintaining a safety buffer at the donor facility.

The system then visualizes the redistribution impact and allows the user to evaluate the situation under different stress conditions.

---

# 🧠 System Architecture

The overall system follows this pipeline:

**Healthcare Facility Data**

↓

**Inventory & Consumption Data**

↓

**MEDWATCH Analytics Engine**

↓

**Stock Coverage Calculation**

↓

**Shortage Pattern Detection**

↓

**Stockout Prediction**

↓

**Regional Risk Analysis**

↓

**Redistribution Recommendation**

↓

**AI Explanation & Reports**

---

# 🛠️ Technology Stack

### Frontend

- HTML
- CSS
- JavaScript
- Interactive data visualizations
- Interactive healthcare network map

### AI / Analytics

- Python-based analytical logic
- Stock coverage calculations
- Consumption trend analysis
- Stockout prediction
- Regional shortage detection
- Redistribution calculations
- Gemini-powered explanations

### Deployment

- GitHub
- GitHub Pages

---

# 👥 Target Users

MEDWATCH is primarily designed for healthcare supply-chain and inventory teams.

### Primary Users

- District healthcare supply-chain officers
- Regional medicine procurement teams
- Healthcare inventory coordinators

### Secondary Users

- Hospital inventory managers
- Healthcare facility administrators
- Procurement and logistics teams

---

# 🌍 Potential Impact

MEDWATCH can help healthcare organizations move from reactive inventory management toward proactive shortage prevention.

Potential benefits include:

- Earlier identification of medicine shortages
- Better visibility across healthcare facilities
- Early warning for regional shortage patterns
- Identification of replenishment gaps
- More efficient use of existing inventory
- Reduced avoidable stockout risk
- Better coordination between facilities
- Data-driven redistribution decisions

---

# 🚀 Future Scope

MEDWATCH can be extended with:

- Real-time hospital inventory integration
- Government medicine-supply databases
- Live procurement and delivery tracking
- More advanced demand forecasting
- Weather and disaster-related supply disruption analysis
- Supplier reliability analysis
- Route optimization for emergency redistribution
- Automated alerts through SMS/email
- Role-based dashboards
- Multi-state healthcare supply networks
- Historical shortage learning using larger datasets

---

# 🏆 Hackathon Value Proposition

MEDWATCH goes beyond a basic inventory dashboard.

It connects:

**Inventory Monitoring**

+

**Regional Pattern Detection**

+

**Stockout Prediction**

+

**Supply Gap Analysis**

+

**Surplus Redistribution**

+

**Stress Testing**

+

**AI Explanation**

into a single healthcare supply-chain decision-support workflow.

The key idea is:

> **Don't wait for the medicine shortage. Detect the pattern early and act using stock that already exists within the network.**

---

# 🔗 Prototype

**Live Demo:**  
https://purple279.github.io/MEDWATCH/

---

# 📂 Project Structure

~~~text
MEDWATCH/
│
├── index.html
├── style.css
├── script.js
├── assets/
│
└── README.md
~~~

---

# 👨‍💻 Team

**Project:** MEDWATCH

**Domain:** Healthcare + Artificial Intelligence + Supply Chain

**Hackathon:** Manipal Hackathon 2026

---

# ⭐ MEDWATCH

**MONITOR → DETECT → PREDICT → REDISTRIBUTE → PREVENT**

MEDWATCH transforms healthcare inventory data into early-warning intelligence so supply-chain teams can identify emerging shortages and take action before stockouts occur.
