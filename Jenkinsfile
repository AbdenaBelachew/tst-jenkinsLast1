pipeline {
    agent any

    environment {
        // Environment variables for deployment
        DEPLOY_USER = 'abdenab'
        DEPLOY_HOST = '10.8.101.33'
        DEPLOY_DIR  = '/home/abdenab/myapp'
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/AbdenaBelachew/tst-jenkinsLast1.git'
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npx vite build'
                }
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Deploy Frontend and Backend') {
            steps {
                // Inject SSH credentials from Jenkins
                withCredentials([sshUserPrivateKey(
                    credentialsId: 'ssh_key',      // Replace with your Jenkins credential ID
                    keyFileVariable: 'SSH_KEY_FILE',
                    usernameVariable: 'SSH_USER'
                )]) {
                    sh """
                    echo "Deploying to ${DEPLOY_HOST}..."
                    
                    # Ensure directory exists and clean it
                    ssh -o StrictHostKeyChecking=no -i "$SSH_KEY_FILE" "$SSH_USER@$DEPLOY_HOST" "mkdir -p '${DEPLOY_DIR}' && rm -rf '${DEPLOY_DIR}/*'"
                    
                    # Upload frontend and backend
                    scp -o StrictHostKeyChecking=no -i "$SSH_KEY_FILE" -r frontend/dist/* "$SSH_USER@$DEPLOY_HOST:$DEPLOY_DIR/frontend/"
                    scp -o StrictHostKeyChecking=no -i "$SSH_KEY_FILE" -r backend/* "$SSH_USER@$DEPLOY_HOST:$DEPLOY_DIR/backend/"
                    
                    echo "Deployment completed successfully!"
                    """
                }
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully!'
        }
        failure {
            echo '❌ Deployment failed! Check logs above.'
        }
    }
}
