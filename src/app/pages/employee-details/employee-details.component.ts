import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Message, MessageService } from 'primeng/api';
import { DocumentCommande } from 'src/app/models/documentCommande';
import { Employee } from 'src/app/models/employee';
import { ApiService } from 'src/app/services/api.service';

@Component({
    selector: 'app-employee-details',
    templateUrl: './employee-details.component.html',
    styleUrl: './employee-details.component.scss',
    providers: [MessageService],
})
export class EmployeeDetailsComponent implements OnInit {
    selectedState: any = null;
    idEmployee: any;
    messages: Message[] =[];
    exist : Employee = new Employee() ; 
    types :any ; 
    documents : DocumentCommande[]=[] ; 
    document : DocumentCommande = new DocumentCommande() ;
    deleteFileDialog : boolean = false ; 
    employee: Employee = {
        id: 0,
        firstname: '',
        lastname: '',
        birthDate: new Date,
        address: '',
        cin: '',
        hireDate: new Date,
        contractEndDate: new Date,
        department: '',
        email: '',
        employmentType: '',
        gender: '',
        jobTitle: '',
        matricule: '',
        phoneNumber: '',
        photo: '',
        salary: 0,
        socialSecurityNumber: '',
    };
    genders : any  ; 
    dropdownItems = [
        { name: 'Option 1', code: 'Option 1' },
        { name: 'Option 2', code: 'Option 2' },
        { name: 'Option 3', code: 'Option 3' },
    ];

    constructor(
        private route: ActivatedRoute,
        private messageService: MessageService,
        private api: ApiService
    ) {}

    ngOnInit(): void {
        this.genders = [
            { label: 'Homme', value: 'Homme' },
            { label: 'Femme', value: 'Femme' }
          ];
        this.types = [
            { label: 'CDD', value: 'CDD' },
            { label: 'CDI', value: 'CDI' },
            { label: 'CIVP', value: 'CIVP' },
            { label: 'Autre', value: 'Autre' }
          ];
          
        this.idEmployee = this.route.snapshot.paramMap.get('id');
        this.getEmployee();
        this.messages = [{ severity: 'info', detail: 'Cliquez sur modifier pour appliquer les changements ' }];
       
    }
    onFileSelected(fileUpload: any) {
        const file = fileUpload.files[0];
        if (file) {
            
        }
    }
    getEmployee() {
        this.api.getEmployeeById(this.idEmployee).subscribe((res) => {
            // Assign the response to employee
            this.employee = res;
    
            // Convert birthDate and hireDate to Date objects if they exist
            if (this.employee.birthDate) {
                this.employee.birthDate = new Date(this.employee.birthDate); // Convert ISO string to Date
            }
            if (this.employee.hireDate) {
                this.employee.hireDate = new Date(this.employee.hireDate); // Convert ISO string to Date
            }
            if (this.employee.contractEndDate) {
                this.employee.contractEndDate = new Date(this.employee.contractEndDate); // Convert ISO string to Date
            }
            if (this.employee.dateSuspension) {
                this.employee.dateSuspension = new Date(this.employee.dateSuspension); // Convert ISO string to Date
            }
            // Make a copy of the employee for comparison or other purposes
            this.exist = { ...this.employee };
        });
    }
    
  
    showMessage() : boolean {
       
        if (this.employee !== this.exist){
          return true 
        }
        
      return false ; 
    }

    checkForChanges(): boolean {
        return JSON.stringify(this.employee) === JSON.stringify(this.exist);
    }
    // onEmployeeChange(): void {
    //     if (this.checkForChanges()) {
    //         this.messages = [{ severity: 'info', detail: 'Cliquez sur modifier pour appliquer les changements ' }];
    //     } else {
    //         this.messages = [];
    //     }
    // }
    updateEmployee() {
            this.api.updateEmployee(this.employee).subscribe(
                (res) => {
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Employee Updated',
                    life: 3000,
                });
               this.getEmployee();
                },
                (error) => {
                    alert(error.message);
                }
            );
        
    }
}
