import '../components/Communications/Communication.css';
import CommsAfterSalesPage from '../components/CommsAfterSales/CommsAfterSalesPage';

export default function CommsAfterSales() {
  return (
    <div className='dashboard-page-container'>
            <div className="dashboard-header-text">Customer Support</div>

            <div className="dashboard-horizontal-alignment">
              <CommsAfterSalesPage />
            </div>
        
    </div>  )
}
 