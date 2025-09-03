import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Employee } from 'src/app/models/employee';
import { SousTraitant } from 'src/app/models/sousTraitant';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-employees-st',
  templateUrl: './employees-st.component.html',
  styleUrl: './employees-st.component.scss', 
  providers :[MessageService]
})
export class EmployeesStComponent {
employee: Employee = new Employee(); // Remplacement de User par Employee
  employeeDialog: boolean = false;
  genders: any;
  deleteEmployeeDialog: boolean = false; // Mise à jour des noms des variables
  deleteEmployeesDialog: boolean = false;

  employees: Employee[] = []; // Remplacement de users par employees

  isDesktop: boolean = true;
  selectedEmployees: Employee[] = []; // Mise à jour de selectedUsers vers selectedEmployees

  loading: boolean = true;
  submitted: boolean = false;

  cols: any[] = [];
  types: any;
  statuses: any[] = [];
  selectedPhotoFile: File | null = null;

  st: SousTraitant | null =null ; 
  // Patterns validation (inchangés car toujours applicables)
  cinPattern: RegExp = /^[0-9]{8}$/;
  adressePattern: RegExp = /^[a-zA-Z]+ [a-zA-Z]|[a-zA-Z 0-9]+$/;
  namePattern: RegExp = /^[a-zA-Z]+$/;
  telPattern: RegExp = /^[0-9]{8}$/;
  emailPattern: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  datePattern: RegExp = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;
  soustraitantId : any ; 
  rowsPerPageOptions = [5, 10, 20];
  isTable :string = 'true' ; 
  stateOptions = [
  { label: 'Table', value: 'true', icon: 'pi pi-table' },
  { label: 'Card', value: 'false', icon: 'pi pi-list' }
];


  constructor(private messageService: MessageService, private api: ApiService,private route : ActivatedRoute, 
     private router: Router) { }

  ngOnInit() {
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
    //  this.soustraitantId = this.route.snapshot.paramMap.get('soustraitantId'); 
      // this.api.getAll Employees().subscribe(res => { // Mise à jour de l'API pour récupérer les employés
      //     this.employees = res;
      //     this.loading = false;
      //     console.log(this.employees);
      // }, err => {
      //     this.loading = false;
      // });
      this.getSt();
      this.cols = [
          { field: 'product', header: 'Product' },
          { field: 'price', header: 'Price' },
          { field: 'category', header: 'Category' },
          { field: 'rating', header: 'Reviews' },
          { field: 'inventoryStatus', header: 'Status' }
      ];

      this.checkScreenSize();
      window.addEventListener('resize', this.checkScreenSize.bind(this));
      this.getSt();
      this.statuses = [
          { label: 'INSTOCK', value: 'instock' },
          { label: 'LOWSTOCK', value: 'lowstock' },
          { label: 'OUTOFSTOCK', value: 'outofstock' }
      ];
  }

  checkScreenSize() {
      this.isDesktop = window.innerWidth >= 768;
  }

  getSt(){
    this.api.getSousTraitantByCodeUsine(3333).subscribe(res=>{
      this.st = res ;   
      this.soustraitantId = res.id; 
      this.getAllEmployees(this.st.id);
    })
  }
  openNew() {
      this.employee = {
          id: 0,
          firstname: '',
          lastname: '',
          birthDate: new Date,
          gender: '',
          email: '',
          phoneNumber: '',
          address: '',
          hireDate: new Date,
          jobTitle: '',
          department: '',
          employmentType: '',
          salary: 0,
          socialSecurityNumber: '',
          matricule: '',
          cin: '',
          photo: '',
          contractEndDate: new Date
      };

      this.submitted = false;
      this.employeeDialog = true;
  }

  deleteSelectedEmployees() {
      this.deleteEmployeesDialog = true;
  }

  editEmployee(employee: Employee) {
      this.employee = { ...employee };
      this.employeeDialog = true;
  }

  deleteEmployee(employee: Employee) {
      this.deleteEmployeeDialog = true;
      this.employee = { ...employee };
  }

  confirmDeleteSelected() {
      this.deleteEmployeesDialog = false;
      this.selectedEmployees.forEach(employee => {
          this.api.deleteEmployee(employee).subscribe(res => {
              // Handle success
          });
      });

      this.employees = this.employees.filter(val => !this.selectedEmployees.includes(val));
      this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Employees Deleted', life: 3000 });
      this.selectedEmployees = [];
  }

  confirmDelete() {
      this.deleteEmployeeDialog = false;
      this.api.deleteEmployee(this.employee).subscribe(res => {
          this.employees = this.employees.filter(val => val.id !== this.employee.id);
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Employee Deleted', life: 3000 });
          this.resetEmployeeForm();
      });
  }

  hideDialog() {
      this.employeeDialog = false;
      this.submitted = false;
  }

  formValide(): boolean {
      return true;
  }
    onGlobalFilter(table: Table, event: Event) {
  table.filterGlobal(
    (event.target as HTMLInputElement).value,
    'contains'
  );
}

  // saveEmployee() {
  //     this.submitted = true;

  //     if (!this.formValide()) {
  //         return;
  //     }

  //     if (
  //         this.employee.firstname?.trim() &&
  //         this.employee.lastname?.trim() &&
  //         this.employee.email?.trim()
  //     ) {
  //         if (this.employee.id) {
  //             this.employees[this.findIndexById(this.employee.id.toString())] = this.employee;

  //             this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Employee Updated', life: 3000 });
  //             this.api.updateEmployee(this.employee).subscribe(res => {
  //                 this.employeeDialog = false;
  //             }, error => {
  //                 alert(error.message);
  //             });
  //         } else {
  //             this.employees.push(this.employee);
  //             this.api.addEmployee(this.employee).subscribe(res => {
  //                 this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Employee Created', life: 3000 });
  //                 this.getAllEmployees();
  //                 this.employeeDialog = false;
  //                 this.resetEmployeeForm();
  //             }, error => {
  //                 alert(error.message);
  //             });
  //         }
  //         this.employees = [...this.employees];
  //     }
  // }

// saveEmployee() {
//   this.submitted = true;

//   if (!this.formValide()) return;

//   if (
//     this.employee.firstname?.trim() &&
//     this.employee.lastname?.trim() &&
//     this.employee.email?.trim()
//   ) {
//     if (this.employee.id) {
//       // 🔄 Cas modification
//       this.api.updateEmployee(this.employee).subscribe({
//         next: (res) => {
//           this.messageService.add({
//             severity: 'success',
//             summary: 'Succès',
//             detail: 'Employé mis à jour',
//             life: 3000
//           });
//           this.uploadPhotoIfNeeded(this.employee.id);
//           this.employeeDialog = false;
//         },
//         error: (error) => {
//           alert(error.message);
//         }
//       });
//     } else {
//       // 🆕 Cas création
//       const employeeToSend = { ...this.employee };
//       delete employeeToSend.photo; // ⚠️ supprime le champ qui casse le POST

//       this.api.addEmployee(employeeToSend).subscribe({
//         next: (createdEmployee) => {
//           this.messageService.add({
//             severity: 'success',
//             summary: 'Succès',
//             detail: 'Employé créé',
//             life: 3000
//           });

//           this.uploadPhotoIfNeeded(createdEmployee.id);
//           this.getAllEmployees();
//           this.employeeDialog = false;
//           this.resetEmployeeForm();
//         },
//         error: (err) => {
//           console.error("❌ Erreur création:", err);
//           alert("Erreur lors de la création : " + err.message);
//         }
//       });
//     }
//   }
// }

saveEmployee() {
this.submitted = true;
if (!this.formValide()) return;

if (
  this.employee.firstname?.trim() &&
  this.employee.lastname?.trim() 
) {
  if (this.employee.id) {
    // 🔁 Modification
    const employeeToUpdate = { ...this.employee };
    delete employeeToUpdate.photo; // 🛑 Supprime le champ base64 avant PUT

    this.api.updateEmployee(employeeToUpdate).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Employé mis à jour',
          life: 3000
        });

        this.uploadPhotoIfNeeded(this.employee.id);
        this.employeeDialog = false;
        this.getSt();
      },
      error: (error) => {
        console.error('❌ Erreur update :', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Échec de la mise à jour',
          life: 3000
        });
      }
    });

  } else {
    // 🆕 Création
    const employeeToSend = { ...this.employee };
    delete employeeToSend.photo;  
      //console.log(this.soustraitantId)
    this.api.addEmployeeForSousTraitant(this.st.id, employeeToSend).subscribe({
      next: (createdEmployee) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Employé créé',
          life: 3000
        });

        this.uploadPhotoIfNeeded(createdEmployee.id);
        this.getSt();
        this.employeeDialog = false;
        this.resetEmployeeForm();
      },
      error: (err) => {
        console.error("❌ Erreur création:", err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de créer l’employé'
        });
      }
    });
  }
}
}

uploadPhotoIfNeeded(employeeId: number) {
if (!this.selectedPhotoFile) return;

console.log("📸 Upload photo pour ID:", employeeId);

this.api.uploadEmployeePhoto(employeeId, this.selectedPhotoFile).subscribe({
  next: () => {
    this.messageService.add({
      severity: 'success',
      summary: 'Photo enregistrée',
      detail: 'La photo a été téléversée avec succès',
    });
    this.selectedPhotoFile = null;
  },
  error: (err) => {
    console.error('❌ Erreur lors de l’upload de la photo :', err);
    this.messageService.add({
      severity: 'error',
      summary: 'Échec de l’upload',
      detail: 'Impossible de téléverser la photo.',
    });
  }
});
}



  getAllEmployees(stId : number) {
      this.api.getEmployeesBySousTraitant(stId).subscribe(
          (res) => {
              // Convert each employee's birthDate and hireDate fields to Date objects
              this.employees = res.map(employee => {
                  if (employee.birthDate) {
                      employee.birthDate = new Date(employee.birthDate); // Convert ISO string to Date
                  }
                  if (employee.hireDate) {
                      employee.hireDate = new Date(employee.hireDate); // Convert ISO string to Date
                  }
                  if (employee.dateSuspension) {
                    employee.dateSuspension = new Date(employee.dateSuspension); // Convert ISO string to Date
                }
                  return employee;
              });
              this.loading = false;
              console.log(this.employees)
              this.suspended = false ; 
          },
          (err) => {
              // console.error('Error fetching employees:', err);
              this.loading = false;
          }
      );
  }
  suspended : boolean = false ; 

  fichePresence(soustraitantId : any ){
    window.open(this.router.serializeUrl(
      this.router.createUrlTree(['/pages/attendance-presence', this.soustraitantId])
    ), '_blank');
    
  }

  getAvatarColor(employee: any): string {
    const colors = ['avatar-blue', 'avatar-green', 'avatar-orange', 'avatar-purple', 'avatar-pink'];
    if (!employee?.firstname) return colors[0];
    const index = employee.firstname.charCodeAt(0) % colors.length;
    return colors[index];
  }
  
  getAllSuspendedEmployees() {
    this.api.getSuspendedEmployeesBySousTraitant(this.soustraitantId).subscribe(
        (res) => {
            // Convert each employee's birthDate and hireDate fields to Date objects
            this.employees = res.map(employee => {
                if (employee.birthDate) {
                    employee.birthDate = new Date(employee.birthDate); // Convert ISO string to Date
                }
                if (employee.hireDate) {
                    employee.hireDate = new Date(employee.hireDate); // Convert ISO string to Date
                }
                if (employee.dateSuspension) {
                  employee.dateSuspension = new Date(employee.dateSuspension); // Convert ISO string to Date
              }
                return employee;
            });
            this.loading = false;
            this.suspended = true ; 
        },
        (err) => {
            // console.error('Error fetching employees:', err);
            this.loading = false;
        }
    );
}
  findIndexById(id: string): number {
      let index = -1;
      for (let i = 0; i < this.employees.length; i++) {
          if (this.employees[i].id.toString() === id) {
              index = i;
              break;
          }
      }

      return index;
  }
  detailsEmployee(id: any) {
      this.router.navigateByUrl("/pages/employee/" + id)
  }
  resetEmployeeForm() {
      this.employee = {
          id: 0,
          firstname: '',
          lastname: '',
          birthDate: new Date,
          gender: '',
          email: '',
          phoneNumber: '',
          address: '',
          hireDate: new Date,
          jobTitle: '',
          department: '',
          employmentType: '',
          salary: 0,
          socialSecurityNumber: '',
          matricule: '',
          cin: '',
          photo: '',
          contractEndDate: new Date
      };
  }

  onFileSelected(event: any): void {
      const file = event.target.files?.[0];
      if (file) {
          this.selectedPhotoFile = file;
          this.previewImage(file);
          this.uploadPhotoAfterCreation(this.employee.id)
      }
  }

  onFileDrop(event: DragEvent): void {
      event.preventDefault();
      const file = event.dataTransfer?.files?.[0];
      if (file) {
          this.selectedPhotoFile = file;
          this.previewImage(file);
      }
  }

  previewImage(file: File): void {
      const reader = new FileReader();
      reader.onload = () => {
          this.employee.photo = reader.result as string; // Pour affichage seulement
      };
      reader.readAsDataURL(file);
  }

  onDragOver(event: DragEvent): void {
      event.preventDefault();
  }

  onDragLeave(event: DragEvent): void {
      event.preventDefault();
      this.uploadPhotoAfterCreation(this.employee.id)
  }

  readAndPreview(file: File | undefined): void {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
          this.employee.photo = reader.result as string;
      };
      reader.readAsDataURL(file);
  }

  removePhoto(): void {
      this.employee.photo = '';
      this.selectedPhotoFile = null;
  }


  uploadPhotoAfterCreation(employeeId: number) {
    if (!this.selectedPhotoFile) return;
  
    console.log("📸 Upload photo pour ID:", employeeId);
    this.loading = true ; 
    this.api.uploadEmployeePhoto(employeeId, this.selectedPhotoFile).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Photo enregistrée',
          detail: 'La photo a été téléversée avec succès',
        });
        this.loading = false ; 
        this.selectedPhotoFile = null;
      },
      error: (err) => {
        console.error('❌ Erreur lors de l’upload de la photo :', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Échec de l’upload',
          detail: 'Impossible de téléverser la photo.',
        });
        this.loading = false ; 
      }
    });
  }
  

}
