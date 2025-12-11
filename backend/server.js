const express = require("express");
const req = require("express/lib/request");
const { google } = require("googleapis");
const cors = require("cors");
const { status } = require("express/lib/response");

const app = express();
app.use(express.json());
app.use(cors({origin:"*"}))

async function getAuthSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  const client = await auth.getClient();

  const googleSheets = google.sheets({
    version: "v4",
    auth: client,
  });

  const spreadsheetId = "1O6Hqrvfsw6QcOOYBUIwYyY9QbBHqIbk11EL_gBVS7-w";

  return {
    auth,
    client,
    googleSheets,
    spreadsheetId,
  };
}

app.post("/login", async (req, res) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();
  const {usuario,senha} = req.body

  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "usuarios",
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
  });
  let valores = getRows.data.values
  valores = valores.filter((iten,key)=>{
    if (iten[0] == usuario && iten[1] == senha){
        return iten
    }
  })


  res.send({status:200,valores:{...valores}});
});

app.get("/getCars", async (req, res) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();
  const  {codigo} = req.query
  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "car_usr",
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
  });
    let valores = getRows.data.values

    valores =  valores.filter((iten,key)=>{
        if(iten[0] == codigo){
            return iten
        }
    })
  res.send({status:"200",valores});
});

app.get("/getGavetas", async (req, res) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();
  const  {codigo} = req.query
  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "car_gav",
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
  });
    let valores = getRows.data.values

    valores =  valores.filter((iten,key)=>{
        if(iten[0] == codigo){
            return iten
        }
    })
  res.send({status:"200",valores});
});

app.get("/metadata", async (req, res) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();

  const metadata = await googleSheets.spreadsheets.get({
    auth,
    spreadsheetId,
  });

  res.send(metadata.data);
});

app.get("/getRows", async (req, res) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();

  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "Página1",
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
  });

  res.send(getRows.data);
});

app.post("/addRow", async (req, res) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();

  const { values } = req.body;

  const row = await googleSheets.spreadsheets.values.append({
    auth,
    spreadsheetId,
    range: "Página1",
    valueInputOption: "USER_ENTERED",
    resource: {
      values: values,
    },
  });

  res.send(row.data);
});

app.post("/updateValue", async (req, res) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();

  const { values } = req.body;

  const updateValue = await googleSheets.spreadsheets.values.update({
    spreadsheetId,
    range: "Página1!A2:C2",
    valueInputOption: "USER_ENTERED",
    resource: {
      values: values,
    },
  });

  res.send(updateValue.data);
});

app.listen(3001, () => console.log("Rodando na porta 3001"));