# Task Requirement Document

## Project Title

**Dynamic Workflow Module**

**Date:** 18-11-2025

------------------------------------------------------------------------

## Purpose

This document outlines the requirements for developing a **Dynamic
Workflow Module** that operates based on a predefined JSON structure and
follows a **BPMN-based process model**.

-   There is no need to build a form creator.\
-   All workflow definitions and UI form structures will be provided
    through JSON.\
-   The core objective is to:
    -   Read the JSON structure\
    -   Render the required workflow steps dynamically\
    -   Ensure the full BPMN lifecycle is followed

The **BPMN workflow** is the primary focus of this assignment.

------------------------------------------------------------------------

## 1. Overview

The goal is to build a module that:

-   Reads a predefined JSON structure (fields, properties, workflow
    steps, rules)
-   Dynamically renders the required form fields for each workflow step
-   Applies validations and conditional logic present in the JSON
-   Executes the workflow in alignment with a BPMN process model
-   Handles data submission and storage at the end of the workflow

------------------------------------------------------------------------

## 2. Main Task (Dynamic Workflow Rendering Using JSON)

You will work with a ready JSON schema and must build the module around
it.

### Key Responsibilities

-   Parse the provided JSON to:
    -   Identify workflow steps\
    -   Identify fields of each step\
    -   Identify rules, validations, and conditional visibility
-   Dynamically render each step of the workflow based on the JSON\
-   Enforce all rules defined in the JSON (validations, dependencies,
    visibility)\
-   Ensure step-by-step execution follows the BPMN model\
-   Submit final collected data to the API

------------------------------------------------------------------------

## 3. BPMN Workflow (Primary Deliverable)

The BPMN workflow should clearly represent the dynamic workflow
lifecycle, similar to process flows modelled in **Camunda**.

### Stages to Include

1.  Start Event\
2.  Load JSON Workflow Definition\
3.  Render Step 1 (Dynamic Fields)\
4.  User Completes Step\
5.  Apply Validations\
6.  Gateway Validation\
7.  Continue Until Final Step\
8.  Submit Data to API\
9.  Store Final Workflow Output\
10. End Event

### Required BPMN Elements

-   Start & End Events\
-   User Tasks\
-   Service Tasks\
-   Gateways (decisions)\
-   Data Objects (JSON Schema, User Submission Data)

> The BPMN diagram must be clean, accurate, and exportable to PNG, SVG,
> or PDF.

------------------------------------------------------------------------

## 4. Requirements

### Functional Requirements

1.  Parse and use the provided JSON workflow definition\
2.  Render each workflow step dynamically using JSON fields\
3.  Support all field types defined in the JSON, such as:
    -   Text\
    -   Number\
    -   Dropdown\
    -   Radio\
    -   Checkbox\
    -   Date\
    -   Text Area\
    -   File Upload\
4.  Apply all validations from the JSON\
5.  Support conditional visibility and rule-based dependencies\
6.  Progress the workflow step-by-step as defined\
7.  Submit final data to the backend API\
8.  Display validation or submission errors clearly

------------------------------------------------------------------------

## 5. Deliverables

### 1. Source Code

-   Dynamic workflow rendering module\
-   JSON parsing logic\
-   Validation engine\
-   Conditional logic handler\
-   Workflow navigation logic\
-   API integration for submission

### 2. BPMN Diagram

-   Complete workflow diagram\
-   Exported as PNG / SVG / PDF

### 3. Documentation

-   How the workflow module functions\
-   How the JSON is interpreted\
-   Validation rules and logic\
-   How to run the module\
-   Example workflow explanation

### 4. Examples

-   Sample JSON (provided)\
-   Screenshots of rendered workflow steps

### 5. Test Cases

-   Step-level validation tests\
-   Conditional behaviour tests\
-   JSON reading tests\
-   Workflow progression tests\
-   Submission success/error handling

------------------------------------------------------------------------

## 6. End View

By the end of this assignment, you will deliver:

-   A fully functional **Dynamic Workflow Module** driven entirely by
    JSON\
-   A detailed, clean **BPMN diagram** representing the workflow
    lifecycle\
-   Clear **test cases** covering validation, workflow steps, and JSON
    rendering
