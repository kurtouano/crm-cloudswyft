import '../components/SalesTeam/SalesTeam.css';
import TeamsTable from '../components/SalesTeam/TeamsTable';
import RegisterEmployee from '../components/SalesTeam/RegisterEmployee';
import ProductivitySpecialist from '../components/SalesTeam/ProductivitySpecialist';
import SpecialistStatsCards from '../components/SalesTeam/SpecialistStatsCards';

export default function SalesTeam() {
  return (
    <>
      <div className='salesteam-page-container'>
        <div className="salesteam-header-text">Sales Team</div>

        <div className="salesteam-horizontal-alignment">
          <TeamsTable />
          <RegisterEmployee />
        </div>

        {/* ProductivitySpecialist + SpecialistStatsCards */}
        <div className="onboarded-salesteam-grid-container">
          <div className="salesteam-chart-card-wrapper">
            <ProductivitySpecialist />
            <SpecialistStatsCards />
          </div>
        </div>
      </div>
    </>
  );
}