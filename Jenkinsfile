pipeline {
    agent any

    environment {
        FRONTEND_SITE = 'Default Web Site'
        FRONTEND_APP  = 'myapp'
        FRONTEND_PATH = 'C:\\inetpub\\wwwroot\\myapp'
        BACKEND_PATH  = 'C:\\inetpub\\backend\\mybackend'
    }

    tools {
        nodejs 'node18'
    }

    stages {

        stage('Install Frontend Dependencies') {
            steps {
                dir('frontend') {
                    bat 'npm install'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    bat 'npm run build'
                }
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir('backend') {
                    bat 'npm install'
                }
            }
        }

        stage('Archive Build') {
            steps {
                archiveArtifacts artifacts: 'frontend/dist/**', fingerprint: true
            }
        }

        stage('Deploy Frontend') {
            steps {
                powershell '''
                $source = "${env:WORKSPACE}\\frontend\\dist"
                $destination = $env:FRONTEND_PATH

                # Clean up old deployment and web.config (to avoid 500 errors)
                if (Test-Path "$destination\\web.config") {
                    Remove-Item "$destination\\web.config" -Force
                }

                if (!(Test-Path $destination)) {
                    New-Item -Path $destination -ItemType Directory -Force
                }
                
                Copy-Item -Path $source\\* -Destination $destination -Recurse -Force
                Write-Host "Frontend files copied to $destination"

                # Manage IIS App safely
                Import-Module WebAdministration
                $site = $env:FRONTEND_SITE
                $appFolder = $env:FRONTEND_APP
                $physPath = $env:FRONTEND_PATH
                $appPath = "IIS:\\Sites\\$site\\$appFolder"

                if (-Not (Test-Path $appPath)) {
                    New-WebApplication -Name $appFolder -Site $site -PhysicalPath $physPath -ApplicationPool "DefaultAppPool"
                    Write-Host "Created IIS Application: $appPath"
                } else {
                    # Use Set-WebConfigurationProperty for more reliable updates (avoids "Value cannot be null" provider bug)
                    Set-WebConfigurationProperty -filter "system.applicationHost/sites/site[@name='$site']/application[@path='/$appFolder']/virtualDirectory[@path='/']" -Name "physicalPath" -Value $physPath
                    Write-Host "IIS Application already exists, updated physicalPath for: $appPath"
                }
                '''
            }
        }

        stage('Deploy Backend') {
            steps {
                powershell '''
                $source = "${env:WORKSPACE}\\backend"
                $destination = $env:BACKEND_PATH
                $port = 3001

                # Clean up existing processes on port 3001
                $processId = (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue).OwningProcess
                if ($processId) {
                    Write-Host "Killing process on port $port (PID: $processId)..."
                    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                }

                if (!(Test-Path $destination)) {
                    New-Item -Path $destination -ItemType Directory -Force
                }
                Copy-Item -Path $source\\* -Destination $destination -Recurse -Force

                # Prevent Jenkins from killing the process
                $env:BUILD_ID = "dontKillMe"

                # Start backend and redirect logs to a file for debugging
                Write-Host "Starting backend..."
                Start-Process "node" -ArgumentList "index.js" -WorkingDirectory $destination -RedirectStandardOutput "$destination\\backend.log" -RedirectStandardError "$destination\\backend_error.log"
                
                # Verify if port 3001 is now listening
                Start-Sleep -Seconds 5
                if (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue) {
                    Write-Host "SUCCESS: Backend is listening on port $port!"
                } else {
                    Write-Host "ERROR: Backend failed to bind to port $port. Check $destination\\backend_error.log for details."
                    if (Test-Path "$destination\\backend_error.log") {
                        Get-Content "$destination\\backend_error.log"
                    }
                    exit 1
                }
                '''
            }
        }

    }

    post {
        success {
            echo 'Full Stack CI/CD pipeline finished successfully!'
        }
        failure {
            echo 'Pipeline failed. Check logs.'
        }
    }
}
