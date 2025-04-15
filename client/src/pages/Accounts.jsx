import '../components/Accounts/Accounts.css';
import AccountPage from '../components/Accounts/AccountPage';
import useMicrosoftAuthentication from '../utils/AuthMicrosoft';

export default function Accounts() {
  useMicrosoftAuthentication();
  
  return (
    <div className='dashboard-page-container'>
            <div className="dashboard-header-text">Accounts</div>

            <div className="dashboard-horizontal-alignment">
              <AccountPage />
            </div>
        
    </div>  )
}
