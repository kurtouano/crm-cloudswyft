import '../components/Accounts/Accounts.css';
import AccountPage from '../components/Accounts/AccountPage';



export default function Accounts() {
  return (
    <div className='dashboard-page-container'>
            <div className="dashboard-header-text">Accounts</div>

            <div className="dashboard-horizontal-alignment">
              <AccountPage />
            </div>
        
    </div>  )
}
