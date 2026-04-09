import time
import os
import threading
from decision_engine import decide
from train import run_training_session

# Global simulation state Let's assume we have plenty of buffer initially
sim_state = {
    "carbon_intensity": 150,
    "hours_to_deadline": 80,
    "estimated_hours_remaining": 8,
    "running": True
}

def metric_simulator():
    """Simulates changing carbon intensity and decreasing time."""
    step = 0
    while sim_state["running"]:
        time.sleep(2) # Every 2 seconds update metrics slightly
        step += 1
        
        sim_state["hours_to_deadline"] -= 1     
        
        # Simulate a carbon spike around step 4
        if step == 4:
            print("\n[GRID EVENT] Coal power plant fired up! Carbon intensity spikes to 600 gCO2/kWh.")
            sim_state["carbon_intensity"] = 600
            
        # Simulate wind picking up later around step 12
        if step == 12:
            print("\n[GRID EVENT] Wind picking up! Carbon intensity drops to 150 gCO2/kWh.")
            sim_state["carbon_intensity"] = 150
            
        # Evaluate decision continuously
        decision = decide(
            sim_state["carbon_intensity"], 
            sim_state["hours_to_deadline"], 
            sim_state["estimated_hours_remaining"]
        )
        
        print(f"\n[MONITOR] Carbon: {sim_state['carbon_intensity']} | "
              f"Deadline: {sim_state['hours_to_deadline']}h | "
              f"Est. left: {sim_state['estimated_hours_remaining']}h -> Action: {decision}")
        
        with open("action.txt", "w") as f:
            f.write(decision)

def main():
    print("[WORKER] Initializing AI Worker node...")
    
    # Clean up the action file from previous runs
    with open("action.txt", "w") as f:
        f.write("RUN")

    sim_thread = threading.Thread(target=metric_simulator, daemon=True)
    sim_thread.start()
    
    while True:            
        print("[WORKER] Starting/Resuming training session...")
        result = run_training_session(max_epochs=12)
        
        if result == "INTERRUPTED":
            try:
                with open("action.txt", "r") as f:
                    action = f.read().strip()
            except:
                action = "PAUSE"
                
            print(f"\n[WORKER] Job was {action}. Waiting until conditions improve...")
            
            # Wait until decision is RUN
            while True:
                time.sleep(2)
                
                decision = decide(
                    sim_state["carbon_intensity"], 
                    sim_state["hours_to_deadline"], 
                    sim_state["estimated_hours_remaining"]
                )
                
                if decision == "RUN":
                    print("\n[WORKER] Conditions improved! Resuming job.")
                    break
            continue
            
        elif result == "DONE":
            print("\n[WORKER] Job completed successfully.")
            break
            
    sim_state["running"] = False
    
if __name__ == "__main__":
    main()