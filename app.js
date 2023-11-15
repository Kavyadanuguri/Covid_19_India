const express = require("express");
const app = express();
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");
app.use(express.json());
const dbpath = path.join(__dirname, "covid19India.db");
let db = null;

const InitializeAndStartServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`dberror : ${e.message}`);
    process.exit(1);
  }
};
InitializeAndStartServer();

const convertDbObjectToResponseObject = (object) => {
  return {
    stateId: object.state_id,
    stateName: object.state_name,
    population: object.population,
  };
};

//API GET

app.get("/states/", async (request, response) => {
  const statesList = `
        select *
        from state
    `;
  const statesArray = await db.all(statesList);
  response.send(
    statesArray.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//API GET ONE

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const stateList = `
        SELECT
           *
        FROM 
          state
        WHERE 
          state_id = ${stateId};`;
  const states = await db.get(stateList);
  response.send(convertDbObjectToResponseObject(states));
});

//API POST

app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const addDistrict = `
      INSERT INTO
      const { districtName, stateId, cases, cured, active, deaths } = request.body;
      district (district_name, state_id, cases, cured, active, deaths)
      VALUES
      (
        '${districtName}',
         ${stateId},
         ${cases},
         ${cured},
         ${active},
         ${deaths},
      );`;
  const insertDetails = await db.run(addDistrict);
  response.send("District Successfully Added");
});

const convertDbObjectToResponseObject1 = (object) => {
  return {
    districtId: object.district_id,
    districtName: object.district_name,
    stateId: object.state_id,
    cases: object.cases,
    cured: object.cured,
    active: object.active,
    deaths: object.deaths,
  };
};

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtList = `
        SELECT
           *
        FROM 
          district
        WHERE 
          district_id = ${districtId};`;
  const district = await db.get(districtList);
  response.send(convertDbObjectToResponseObject1(district));
});

//API DELETE
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDetails = `
     DELETE FROM 
       district
     WHERE 
        district_id = ${districtId};`;
  await db.run(deleteDetails);
  response.send("District Removed");
});

//API PUT
app.put("/districts/:districtId/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const { districtId } = request.params;
  const updateDistrictDetails = `
        UPDATE
          district
        SET
         district_name = '${districtName}',
         state_id = ${stateId},
         cases =${cases},
         cured= ${cured},
         active = ${active},
         deaths =${deaths}
        WHERE
         district_id = ${districtId};`;

  await db.run(updateDistrictDetails);
  response.send("District Details Updated");
});

const convertToCamelCase = (obj) => {
  return {
    totalCase: obj.case,
    totalCured: obj.cured,
    totalActive: obj.active,
    totalDeaths: obj.deaths,
  };
};

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStateNames = `
        SELECT cases, cured, active, deaths
        from district
        where 
       state_id = ${stateId};`;

  const stateNames = await db.all(getStateNames);
  response.send(stateNames.map((each) => convertToCamelCase(each)));
});

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictNames = `
        SELECT state_name
        from state 
         join district on state.state_id = district.state_id;
        WHERE
            district_id = ${districtId};`;

  const districtNames = await db.all(getDistrictNames);
  response.send(
    districtNames.map((each) => convertDbObjectToResponseObject(each))
  );
});

module.exports = app;
