// import { Storage } from '@google-cloud/storage';
// import path from 'path';

// const storage = new Storage({
//     keyFilename: path.join(__dirname, 'path/to/your-service-account-file.json'),
//     projectId: 'your-project-id',
// });

// const bucketName = 'your-bucket-name';
// const bucket = storage.bucket(bucketName);

// export const uploadFile = async (file) => {
//     const { originalname, buffer } = file;
//     const blob = bucket.file(originalname.replace(/ /g, "_"));
//     const blobStream = blob.createWriteStream({
//         resumable: false,
//     });

//     return new Promise((resolve, reject) => {
//         blobStream
//             .on('finish', () => {
//                 const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
//                 resolve(publicUrl);
//             })
//             .on('error', (err) => {
//                 reject(err);
//             })
//             .end(buffer);
//     });
// };
