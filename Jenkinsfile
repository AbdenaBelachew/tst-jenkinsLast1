pipeline {
    agent any
    
    stages {
        
        stage('Clone Source') {
            steps {
                // Clone your GitHub repository
                git url: 'https://github.com/AbdenaBelachew/tst-jenkinsLast1.git', branch: 'main'
            }
        }
        
        stage('Build / Prepare') {
            steps {
                echo "Repository cloned. You can add build steps here if needed."
                // For example, if this repo contains a build script, you can run it.
                // sh 'chmod +x build.sh && ./build.sh'
            }
        }
        
        stage('Deploy to Ubuntu') {
            steps {
                // Use the SSH credentials you added in Jenkins
                sshagent(['linux-ssh-creds']) {
                    // Create deploy directory on the target server
                    sh '''
                      ssh -o StrictHostKeyChecking=no abdenab@10.8.101.33 "mkdir -p ~/deploy"
                    '''
                    
                    // Copy the repository contents from Jenkins to the target machine
                    sh '''
                      scp -o StrictHostKeyChecking=no -r $WORKSPACE/* abdenab@10.8.101.33:~/deploy/
                    '''
                    
                    // Run a remote command after deployment (optional)
                    sh '''
                      ssh -o StrictHostKeyChecking=no abdenab@10.8.101.33 "echo Deployment from Jenkins completed."
                    '''
                }
            }
        }
        
    }
    
    post {
        success {
            echo 'Pipeline completed successfully.'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}
