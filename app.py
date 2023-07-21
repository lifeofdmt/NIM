import os
import random

from cs50 import SQL
from flask import Flask, flash, redirect, render_template, request, session
from flask_session import Session
from tempfile import mkdtemp
from datetime import datetime
from helpers import apology

# Configure application
app = Flask(__name__)

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///nim.db")

# Game variables
max_piles = 6
max_epochs = 10000

@app.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0.
    response.headers["Pragma"] = "no-cache"
    return response


@app.route("/", methods=["GET","POST"])
def home():
    return render_template('index.html')

@app.route("/game", methods=["GET", "POST"])
def game():
    if request.method == 'GET':
        return render_template('params.html')
    else:
        if request.form.get("param") == "custom":
            piles = request.form.get("piles")
            epochs = request.form.get("epochs")

            if not piles or not epochs:
                return apology(message="Missing input")
        elif request.form.get("param") == "random":
            piles = random.randrange(2, max_piles+1)
            epochs = random.randrange(max_epochs)
        else:
            return apology(message="Nice Try")
        return render_template("game.html", name="random", piles=piles, epochs=epochs)

@app.route("/help", methods=["GET"])
def help():
    return render_template("help.html")
     

