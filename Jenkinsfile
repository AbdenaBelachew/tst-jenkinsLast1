pipeline {
    agent any

    environment {
        SERVER_USER     = 'abdenab'
        SERVER_HOST     = '10.8.101.33'
        SSH_CREDS_ID    = 'linux-ssh-creds'
        FRONTEND_TARGET = '/var/www/myapp'
    }

    stages {

        stage('Prepare') {
            steps {
                echo "💻 Building on: ${env.NODE_NAME}"

                // Use ONLY one branch (fixes your confusion)
                git branch: 'newbr', url: 'https://github.com/AbdenaBelachew/tst-jenkinsLast1.git'
            }
        }

        stage('Build Frontend') {
            steps {
                echo "🏗️ Starting Fresh Build..."
                sh 'npm install'
                // CI=false prevents failing on minor lint/style warnings
                sh 'env CI=false npm run build'
                
                // DIAGNOSTIC STEP: Check file structure to catch 'assets/' vs 'static/' mismatches
                echo "📊 Listing Build Artifacts:"
                sh 'ls -R build'
            }
        }

        stage('Deploy Frontend') {
            steps {
                script {
                    if (!fileExists('build/index.html')) {
                        error "❌ Deployment aborted: 'build/index.html' missing!"
                    }
                }
                
                sshagent([env.SSH_CREDS_ID]) {
                    sh """
                    set -e
                    echo "===== PREPARING SERVER DIRECTORY ====="
                    # Note: We wipe the server folder to prevent old Vite 'assets/' from lingering
                    ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${SERVER_USER}@${SERVER_HOST} "
                        sudo mkdir -p ${FRONTEND_TARGET} && 
                        sudo rm -rf ${FRONTEND_TARGET}/* &&
                        sudo chown -R ${SERVER_USER}:${SERVER_USER} ${FRONTEND_TARGET}
                    "

                    echo "===== RSYNC BUILD TO PRODUCTION ====="
                    rsync -avz --delete build/ ${SERVER_USER}@${SERVER_HOST}:${FRONTEND_TARGET}/

                    echo "===== APPLYING NGINX PERMISSIONS & RESTARTING ====="
                    ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${SERVER_USER}@${SERVER_HOST} "
                        sudo chown -R www-data:www-data ${FRONTEND_TARGET} &&
                        sudo find ${FRONTEND_TARGET} -type d -exec chmod 755 {} \\; &&
                        sudo find ${FRONTEND_TARGET} -type f -exec chmod 644 {} \\; &&
                        sudo nginx -t && sudo systemctl restart nginx
                    "
                    """
                }
            }
        }
    }

    post {
        success {
            echo '✅ Clean production deployment successful to /var/www/myapp'
        }
        failure {
            echo '❌ Deployment failed! Please check if "npm run build" produced a "build/" or "dist/" folder.'
        }
        always {
            // Clean workspace to keep agent tidy
            deleteDir()
        }
    }
}
