import { Employee, IEmployeeOrgApp } from "./IEmployeeOrgApp";

export class EmployeeOrgApp implements IEmployeeOrgApp {

    public ceo: Employee;
    public past: Employee[] = [];
    public future: Employee[] = [];
    public removedEmployeeObj: Employee | null = null;

    constructor(ceo: Employee) {
        this.ceo = ceo;
    }

    /**
     * Used to move employee from one supervisor to another
     * @param employeeID 
     * @param supervisorID 
     */
    move(employeeID: number, supervisorID: number) {
        this.past = [this.copyObject(this.ceo), ...this.past];
        this.future = [];

        this.ceo = this.removeEmployee(this.ceo, employeeID, supervisorID);
        if (this.removedEmployeeObj) {
            this.ceo = this.changeEmployeeSupervisor(this.ceo, supervisorID, this.removedEmployeeObj);
            this.removedEmployeeObj = null;
        }
    }

    copyObject(obj: any) {
        let clone = {...obj};
        Object.keys(clone).forEach(
            key => (clone[key] = typeof obj[key] === 'object' ? this.copyObject(obj[key]) : obj[key])
        );
        return Array.isArray(obj) ? (clone.length = obj.length) ? Array.from(clone) : [] : clone;
    };

    /**
     * Used to undo functionality
     * @returns 
     */
    undo() {
        if (!this.past.length) {
            return;
        }
        const previous = this.past[0];
        const newPast = this.past.slice(1);
        this.past = newPast;
        this.future = [this.ceo, ...this.future];
        this.ceo = previous;
    }

    /**
     * Used to redo functionality
     * @returns 
     */
    redo() {
        if (!this.future) {
            return;
        }
        const next = this.future[0];

        const newFuture = this.future.slice(1);
        this.past = [this.ceo, ...this.past];
        this.ceo = next;
        this.future = newFuture;

    }

    /**
     * Used to remove employee from give supervisorID
     * @param obj 
     * @param id 
     * @param parentId 
     * @returns 
     */
    removeEmployee(obj: Employee, id: number, parentId = -1): Employee {

        if (obj.uniqueId === parentId) {
            const removed = obj.subordinates.filter(i => i.uniqueId === id)[0];
            obj.subordinates = obj.subordinates.filter(i => i.uniqueId !== id);
            // get first child and place at removed element
            if (removed && removed.subordinates.length > 0) {
                let first = removed.subordinates[0];
                first.subordinates = removed.subordinates.slice(1);
                obj.subordinates.unshift(first);
            }
            this.removedEmployeeObj = {
                ...removed,
                subordinates: []
            }
            return obj;
        } else {
            return {
                ...obj,
                subordinates: obj.subordinates.map((subObj) => {
                    if (subObj.uniqueId === id) {
                        this.removeEmployee(obj, id, obj.uniqueId);
                        return subObj;
                    } else {
                        if (subObj.subordinates && subObj.subordinates.length > 0) {
                            this.removeEmployee(subObj, id);
                        }
                        return subObj;
                    }
                }),
            }
        }
    }

    /**
     * Used to add change employee supervisor
     * @param obj 
     * @param supervisorID 
     * @param newEmployee 
     * @returns 
     */
    changeEmployeeSupervisor(obj: Employee, supervisorID: number, newEmployee: Employee): Employee {
        return {
            ...obj,
            subordinates: obj.subordinates.map((subObj) => {
                if (subObj.uniqueId === supervisorID) {
                    subObj.subordinates.push(newEmployee);
                    return subObj;
                } else {
                    if (subObj.subordinates && subObj.subordinates.length > 0) {
                        this.changeEmployeeSupervisor(subObj, supervisorID, newEmployee);
                    }
                    return subObj;
                }
            }),
        }
    }
}
