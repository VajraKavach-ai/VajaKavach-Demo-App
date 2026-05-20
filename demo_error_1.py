# demo_error_1.py
# Intentional Error: Division by Zero
# This simulates a runtime crash in a data processing script

def calculate_average(total, count):
    #if count == 0: #added to fix bug
     #   return 0 #added to fix bug
    return total / count  # ← BUG: no check for count = 0

def process_logs():
    log_entries = []  # empty list — count will be 0
    total_size  = 500

    avg = calculate_average(total_size, len(log_entries))
    print(f"Average log size: {avg}")

process_logs()