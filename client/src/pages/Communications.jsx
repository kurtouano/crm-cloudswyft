import '../components/Communications/Communication.css';
import CommunicationPage from '../components/Communications/CommunicationPage';

export default function Communications() {
  return (
    <div className='dashboard-page-container'>
            <div className="dashboard-header-text">Revenue Comms</div>

            <div className="dashboard-horizontal-alignment">
              <CommunicationPage />
            </div>
        
    </div>  )
}
 