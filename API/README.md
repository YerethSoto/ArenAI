## Instructions for configure ArenAI

## **1. Prerequisites**

- Python 3.12 or higher  
  Check your version:

```
python --version
```

## **2. Create a virtual environment**
- 1. Create
```
python -m venv venv
```
- 2. Activate
```
.\venv\Scripts\activate
```
## **3. Install requirements**

- You need to run the following command:
```
    pip install -r requirements.txt
```

## **4. Run the app**
- Execute the following command on CLI: 
```
    python -m uvicorn app:app --reload
```