const { exec } = require('child_process');
   const path = require('path');

   module.exports = (req, res) => {
     const dotnetPath = path.join(__dirname, 'MeteoApi.dll');
     exec(`dotnet ${dotnetPath}`, (error, stdout, stderr) => {
       if (error) {
         console.error(`Error executing .NET: ${error}`);
         return res.status(500).json({ error: 'Internal server error' });
       }
       res.status(200).json({ message: stdout || 'Datos actualizados' });
     });
   };
