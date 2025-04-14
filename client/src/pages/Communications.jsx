import '../components/Communications/Communication.css';
import CommunicationPage from '../components/Communications/CommunicationPage';
import useMicrosoftAuthentication from '../utils/AuthMicrosoft';

export default function Communications() {
  useMicrosoftAuthentication();
  
  return (
    <div className='dashboard-page-container'>
            <div className="dashboard-header-text">Revenue Comms</div>

            <div className="dashboard-horizontal-alignment">
              <CommunicationPage />
            </div>
        
    </div>  )
}
 