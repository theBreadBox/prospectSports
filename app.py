from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import requests
import os
import contextlib
import json
from datetime import datetime 
import sys
from io import StringIO
import contextlib
import psycopg2 

load_dotenv()

app = Flask(__name__)
CORS(app) 

def connect_to_db():
    """Connect to the Neon Postgres database"""
    load_dotenv()
    try: 
        conn = psycopg2.connect('postgresql://neondb_owner:npg_z0aGQALYM5Tt@ep-tiny-brook-a8s12057-pooler.eastus2.azure.neon.tech/neondb?sslmode=require')
        return conn
    except Exception as e:
        print(f"Error connecting to the database: {str(e)}")
        return None

@app.route('/submitWallet', methods=['POST'])


def store_wallet_address():
    """Store the user's wallet address from the front end"""
    try:
        # Get the wallet address from the request
        address = request.json.get('wallet_address')
        
        if not address:
            return jsonify({'error': 'Wallet address is required'}), 400
        
        # Connect to the database
        conn = connect_to_db()
        cur = conn.cursor()

        # Insert the wallet address into the database
        insert_query = """
        INSERT INTO presale_list (wallet_address)
        VALUES (%s);
        """
        cur.execute(insert_query, (address,))
        conn.commit()

        cur.close()
        conn.close()

        return jsonify({'message': 'Wallet address stored successfully'}), 200

    except Exception as e:
        print(f"Error storing wallet address: {str(e)}")
        return jsonify({'error': 'Internal Server Error'}), 500

@app.route('/')
def home():
    return 'Welcome to Prospect Sports API!'

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)