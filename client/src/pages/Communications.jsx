import '../components/Communications/Communication.css';
import CommunicationPage from '../components/Communications/CommunicationPageNEW';

export default function Communications() {
  return (
    <div className='dashboard-page-container'>
            <div className="dashboard-header-text">Inbox</div>

            <div className="dashboard-horizontal-alignment">
              <CommunicationPage />
            </div>
        
    </div>  )
}
 