# ThePornDB
A Porn database

## API Spec

URL: https://theporndb.herokuapp.com/

GET [/api/scenes/](https://theporndb.herokuapp.com/api/scenes/)

**Parameters**
|Field|Type|Description|
|---|---|---|
|paysite|string|name of paysite. eg: brazzers|
|title|string|scene title|
|date|string|scene release date in YYYY-MM-DD format   |
|tags|array|array containing list of strings|
|actors|array|array containing list of actors|

If no parameters is specified, returns scenes released in last 7 days.

**Response**
	

    {
      "unique_id": "girlsway_girlswaypilots_1194935",
      "paysite": "girlsway",
      "site": "girlswaypilots",
      "title": "Breastfeeding The Babysitter",
      "date": "2018-03-05",
      "data18_id": "1194935",
      "description": "Aali Kali is pumping...",
      "tags": [
        "Lesbian",
        "Hairy Pussy",
        "Girl Girl",
        "Latin",
        "Blondes",
        "Brunettes"
      ],
      "actors": [
        "Abella Danger",
        "Aali Kali"
      ]
    }
  
GET [/api/actors/](https://theporndb.herokuapp.com/api/actors/)
  
**Parameters**
|Field|Type|Description|
|---|---|---|
|name|string|actor's name|
|gender|string|actor's gender|
|alias|array|array of strings of known aliases|
|country|string|actor's country|
|cupSize|string|cupsize if female/trans|
|ethnicity|string|actor's gender|

**Response**

 
     {
      "name": "Romi Rain",
      "gender": "female",
      "country": "USA",
      "cupSize": "34E",
    }

