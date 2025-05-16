# Device Dashboard | Tableau de Bord des Appareils

A web interface to manage and access network devices through a browser.  
Une interface web pour gérer et accéder aux appareils réseau via un navigateur.

## Prerequisites | Prérequis

- Python 3.9+ | Python 3.9 ou supérieur
- Node.js 16+ | Node.js 16 ou supérieur
- Google Chrome browser | Navigateur Google Chrome
- Network access to devices | Accès réseau aux appareils

## Installation

### Windows

1. Download or clone this repository | Téléchargez ou clonez ce dépôt
2. Run `setup.bat` as administrator | Exécutez `setup.bat` en tant qu'administrateur
3. Update credentials in `.env` | Mettez à jour les identifiants dans `.env`
4. Run `start.bat` to launch | Exécutez `start.bat` pour lancer

### macOS

1. Download or clone this repository | Téléchargez ou clonez ce dépôt
2. Open terminal in project folder | Ouvrez le terminal dans le dossier
3. Make scripts executable | Rendez les scripts exécutables:
```bash
chmod +x setup.sh start.sh
```
4. Run setup | Lancez l'installation:
```bash
./setup.sh
```
5. Update credentials in `.env` | Mettez à jour les identifiants
6. Start the application | Démarrez l'application:
```bash
./start.sh
```

## Configuration

### Device Settings | Paramètres des Appareils
Edit `config/devices.json` | Modifiez `config/devices.json`:
```json
{
  "devices": [
    {
      "name": "Device 1 | Appareil 1",
      "ip": "xxx.xxx.xxx.xxx"
    }
  ]
}
```

### Environment Variables | Variables d'Environnement
Update `.env` file | Mettez à jour le fichier `.env`:
```env
DEVICE_USERNAME=your_username
DEVICE_PASSWORD=your_password
```

## Usage | Utilisation

1. Start the application using appropriate script | Démarrez avec le script approprié
2. Open browser to | Ouvrez le navigateur à: http://localhost:3000
3. Click on a device | Cliquez sur un appareil
4. Login is automatic | La connexion est automatique

## Development | Développement

- Backend: Flask API (port 5001)
- Frontend: React (port 3000)
- Chrome automation | Automatisation: Selenium WebDriver

## Common issues | Problèmes courants:
- Chrome not starting | Chrome ne démarre pas → Check installation
- Login fails | Échec connexion → Check `.env` credentials