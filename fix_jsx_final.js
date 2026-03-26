const fs = require('fs');
const path = 'c:/Tortox/frontend/src/components/product.jsx';
let content = fs.readFileSync(path, 'utf8');

// I'll manually search for the end of the modal contents and the closing sequence.
// We want to replace everything from the "Done Configuring" button to the end of the component.

const startMarker = '<button type=\"button\" onClick={() => setIsVariantModalOpen(false)}';
const startIndex = content.lastIndexOf(startMarker);

if (startIndex !== -1) {
    // Find the end of that button tag
    const endButtonIndex = content.indexOf('</button>', startIndex) + 9;

    // Everything from that </button> to the end we'll rewrite correctly.
    // The sequence we want:
    //   </div> (closes the button div)
    //   </div> (closes the maxWidth: 1300 div)
    //   </motion.div> (closes the modal motion.div)
    //   </motion.div> (closes the backdrop motion.div)
    //   )} (closes the isOpen condition)
    //   </AnimatePresence>
    //   ); (closes the return)
    // }; (closes the component)

    const newEnd = `
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
`;
    // Wait! I also need to check if BackdropStyle etc are preserved.
    const endOfFileIdx = content.lastIndexOf('const backdropStyle');
    const backdropPart = content.substring(endOfFileIdx);

    const finalContent = content.substring(0, endButtonIndex) + newEnd + "\n" + backdropPart;
    fs.writeFileSync(path, finalContent);
    console.log('Fixed JSX with correct nesting.');
} else {
    console.log('Could not find start marker.');
}
