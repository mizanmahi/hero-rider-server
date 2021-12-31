const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const dotenv = require('dotenv').config();
const fileUpload = require('express-fileupload');

const app = express();
const port = process.env.PORT || 5000; // important for deploy

// middleware
app.use(cors());
app.use(express.json({ limit: 2000000 }));
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@phero-crud.9f5td.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
   useNewUrlParser: true,
   useUnifiedTopology: true,
});

const main = async () => {
   try {
      // Connect the client to the server
      await client.connect();
      console.log('Connected successfully to Mongo');

      const database = client.db('hero-rider');
      const userCollection = database.collection('users');

      // APIs

      // save users
      app.post('/saveUser', async (req, res) => {
         const { userProfileImage, userNidImage, userLicenseImage } = req.files;
         const otherUserData = req.body;

         const userProfileImageData = userProfileImage?.data;
         const encodedProfileImage = userProfileImageData.toString('base64');
         const profileImageBuffer = Buffer.from(encodedProfileImage, 'base64');

         const userNidImageData = userNidImage?.data;
         const encodedNidImage = userNidImageData.toString('base64');
         const nidImageBuffer = Buffer.from(encodedNidImage, 'base64');

        if(userLicenseImage){
            const userLicenseImageData = userLicenseImage?.data;
            const encodedLicenseImage = userLicenseImageData.toString('base64');
            const licenseImageBuffer = Buffer.from(encodedLicenseImage, 'base64');


            const result = await userCollection.insertOne({...otherUserData, images: { profileImage: profileImageBuffer, nidImage: nidImageBuffer, licenseImage: licenseImageBuffer }});
            res.json({
                message: 'User saved successfully',
                userId: result.insertedId,
            })
        }else{

            const result = await userCollection.insertOne({...otherUserData, images: { profileImage: profileImageBuffer, nidImage: nidImageBuffer }});
             res.json({
                message: 'User added successfully',
                userId: result.insertedId,
             });
        }
        
         
      });

        // get user profile data
        app.get('/userProfile/:email', async (req, res) => {
            const { email } = req.params;
            console.log(email);
            const result = await userCollection.findOne({ userEmail: email });
            res.json(result);
        })

   } catch (err) {
      console.error(err);
   } finally {
      //   await client.close();
   }
};

main().catch((err) => console.dir);

app.get('/', (req, res) => {
   res.send('Hello From Hero Rider Server 🏍');
});

app.listen(port, () => {
   console.log(`Hero Rider's Server is listening at http://localhost:${port}`);
});
