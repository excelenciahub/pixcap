export interface Employee {
    uniqueId: number;
    name: string;
    subordinates: Array<Employee>;
}

export interface IEmployeeOrgApp {

    ceo: Employee;

    /**
     * Moves the employee with employeeID (uniqueId) under a supervisor
     * @param employeeID 
     * @param supervisorID 
     */
    move(employeeID: number, supervisorID: number): void;

    /**
     * * Undo last move action
     */
    undo(): void;
    
    /**
     * Redo last undone action
     */
    redo(): void;

}